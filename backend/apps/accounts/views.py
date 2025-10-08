"""
Views for the accounts app.
"""

import requests
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialAccount

from .models import AdminRole, AdminAssignment, AuditLog
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    AdminRoleSerializer, AdminRoleCreateSerializer,
    AdminAssignmentSerializer, AdminAssignmentCreateSerializer,
    AuditLogSerializer, PermissionCheckSerializer, PermissionResultSerializer,
    UserPermissionsSerializer, RoleTemplateSerializer,
    AdminRoleAssignmentSerializer, UserPermissionUpdateSerializer,
    InstituteAccessSerializer, UserAccessSummarySerializer
)
from .permissions import (
    UserManagementPermission, AdminManagementPermission
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserManagementPermission]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        user = self.request.user

        # Super admins can see all users
        if user.is_super_admin():
            return User.objects.all()

        # System admins can see all users
        if user.is_system_admin():
            return User.objects.all()

        # Institute admins can only see users in their institutes
        if user.is_institute_admin():
            institutes = user.admin_institutes.all()
            return User.objects.filter(tenant__in=institutes)

        # Regular users can only see themselves
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def check_permission(self, request, pk=None):
        """Check if user has specific permission."""
        user = self.get_object()
        serializer = PermissionCheckSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data

            if data.get('permission'):
                has_perm = user.has_permission(data['permission'])
                result = {
                    'allowed': has_perm,
                    'reason': (
                        'Permission granted' if has_perm else
                        'Permission denied'
                    )
                }
            else:
                has_perm = user.has_resource_permission(
                    data['resource'], data['action']
                )
                result = {
                    'allowed': has_perm,
                    'reason': (
                        'Resource access granted' if has_perm else
                        'Resource access denied'
                    )
                }

            return Response(result)

        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get user permissions summary."""
        user = self.get_object()
        permissions_data = user.get_role_permissions()
        serializer = UserPermissionsSerializer(data=permissions_data)
        serializer.is_valid()
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_permissions(self, request, pk=None):
        """Update user permissions."""
        user = self.get_object()
        serializer = UserPermissionUpdateSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data

            # Update permissions
            for field, value in data.items():
                if hasattr(user, field):
                    setattr(user, field, value)

            user.save()

            return Response({'message': 'Permissions updated successfully'})

        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'])
    def access_summary(self, request, pk=None):
        """Get user access summary."""
        user = self.get_object()

        # Get accessible institutes
        institutes = user.get_accessible_institutes()
        institute_access = []

        for institute in institutes:
            access_data = {
                'institute_id': str(institute.id),
                'institute_name': institute.name,
                'has_access': True,
                'permissions': user.get_admin_permissions(),
                'assigned_roles': list(
                    user.admin_assignments.filter(
                        institute=institute, is_active=True
                    ).values_list('role__name', flat=True)
                )
            }
            institute_access.append(access_data)

        summary_data = {
            'user': UserSerializer(user).data,
            'accessible_institutes': institute_access,
            'total_permissions': len(user.get_admin_permissions()),
            'active_roles': (
                user.admin_assignments.filter(is_active=True).count()
            ),
            'last_activity': user.last_activity,
            'is_locked': user.is_locked()
        }

        serializer = UserAccessSummarySerializer(data=summary_data)
        serializer.is_valid()
        return Response(serializer.data)


class AdminRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin role management.
    """
    queryset = AdminRole.objects.all()
    serializer_class = AdminRoleSerializer
    permission_classes = [AdminManagementPermission]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return AdminRoleCreateSerializer
        return AdminRoleSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        user = self.request.user

        # Super admins can see all roles
        if user.is_super_admin():
            return AdminRole.objects.all()

        # System admins can see all roles except super admin roles
        if user.is_system_admin():
            return AdminRole.objects.exclude(role_type='super_admin')

        # Institute admins can only see institute and lower level roles
        if user.is_institute_admin():
            return AdminRole.objects.filter(
                role_type__in=[
                    'institute_admin', 'department_admin', 'faculty_admin'
                ]
            )

        return AdminRole.objects.none()

    @action(detail=False, methods=['get'])
    def templates(self, request):
        """Get role templates."""
        # Define role templates locally to avoid import issues
        ROLE_TEMPLATES = {
            'super_admin': {
                'name': 'Super Administrator',
                'description': 'Full system access',
                'type': 'super_admin',
                'defaultPermissions': [],
                'defaultResources': [],
                'defaultActions': [],
                'isSystem': True
            },
            'system_admin': {
                'name': 'System Administrator',
                'description': 'System-wide administration',
                'type': 'system_admin',
                'defaultPermissions': [],
                'defaultResources': [],
                'defaultActions': [],
                'isSystem': True
            }
        }

        templates = []
        for key, template in ROLE_TEMPLATES.items():
            template_data = {
                'name': template['name'],
                'description': template['description'],
                'type': template['type'],
                'default_permissions': template['defaultPermissions'],
                'default_resources': template['defaultResources'],
                'default_actions': template['defaultActions'],
                'is_system': template['isSystem']
            }
            templates.append(template_data)

        serializer = RoleTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Get assignments for a specific role."""
        role = self.get_object()
        assignments = role.assignments.filter(is_active=True)
        serializer = AdminAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class AdminAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin assignment management.
    """
    queryset = AdminAssignment.objects.all()
    serializer_class = AdminAssignmentSerializer
    permission_classes = [AdminManagementPermission]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return AdminAssignmentCreateSerializer
        return AdminAssignmentSerializer

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        user = self.request.user

        # Super admins can see all assignments
        if user.is_super_admin():
            return AdminAssignment.objects.all()

        # System admins can see all assignments except super admin assignments
        if user.is_system_admin():
            return AdminAssignment.objects.exclude(
                role__role_type='super_admin'
            )

        # Institute admins can only see assignments in their institutes
        if user.is_institute_admin():
            institutes = user.admin_institutes.all()
            return AdminAssignment.objects.filter(institute__in=institutes)

        return AdminAssignment.objects.none()

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """Bulk assign roles to users."""
        serializer = AdminRoleAssignmentSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data
            user_ids = data['user_ids']
            role_id = data['role_id']
            institute_id = data.get('institute_id')
            expires_at = data.get('expires_at')
            notes = data.get('notes')

            try:
                role = AdminRole.objects.get(id=role_id)
                institute = None
                if institute_id:
                    from apps.tenants.models import Tenant
                    institute = Tenant.objects.get(id=institute_id)

                assignments = []
                for user_id in user_ids:
                    user = User.objects.get(id=user_id)
                    assignment = AdminAssignment.objects.create(
                        user=user,
                        role=role,
                        institute=institute,
                        assigned_by=request.user,
                        expires_at=expires_at,
                        notes=notes,
                        is_active=True
                    )
                    assignments.append(assignment)

                # Update user permissions
                for assignment in assignments:
                    user = assignment.user
                    user.can_manage_users = (
                        user.can_manage_users or role.can_manage_users
                    )
                    user.can_manage_admins = (
                        user.can_manage_admins or role.can_manage_admins
                    )
                    user.can_manage_institutes = (
                        user.can_manage_institutes or
                        role.can_manage_institutes
                    )
                    user.can_manage_tenants = (
                        user.can_manage_tenants or role.can_manage_tenants
                    )
                    user.can_view_analytics = (
                        user.can_view_analytics or role.can_view_analytics
                    )
                    user.can_manage_settings = (
                        user.can_manage_settings or role.can_manage_settings
                    )
                    user.can_manage_billing = (
                        user.can_manage_billing or role.can_manage_billing
                    )
                    user.can_manage_security = (
                        user.can_manage_security or role.can_manage_security
                    )
                    user.save()

                return Response({
                    'message': (
                        f'Successfully assigned role to '
                        f'{len(assignments)} users'
                    ),
                    'assignments_count': len(assignments)
                })

            except (AdminRole.DoesNotExist, User.DoesNotExist) as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an admin assignment."""
        assignment = self.get_object()
        assignment.is_active = False
        assignment.save()

        # Recalculate user permissions
        user = assignment.user
        user._recalculate_permissions()

        return Response({'message': 'Assignment deactivated successfully'})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for audit log viewing.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        user = self.request.user

        # Super admins can see all audit logs
        if user.is_super_admin():
            return AuditLog.objects.all()

        # System admins can see all audit logs
        if user.is_system_admin():
            return AuditLog.objects.all()

        # Institute admins can only see audit logs in their institutes
        if user.is_institute_admin():
            institutes = user.admin_institutes.all()
            return AuditLog.objects.filter(
                user__tenant__in=institutes
            )

        # Regular users can only see their own audit logs
        return AuditLog.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my_activity(self, request):
        """Get current user's activity log."""
        logs = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class PermissionCheckViewSet(viewsets.ViewSet):
    """
    ViewSet for permission checking.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def check(self, request):
        """Check user permissions."""
        serializer = PermissionCheckSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user

            if data.get('permission'):
                has_perm = user.has_permission(data['permission'])
                result = {
                    'allowed': has_perm,
                    'reason': (
                        'Permission granted' if has_perm else
                        'Permission denied'
                    )
                }
            else:
                has_perm = user.has_resource_permission(
                    data['resource'], data['action']
                )
                result = {
                    'allowed': has_perm,
                    'reason': (
                        'Resource access granted' if has_perm else
                        'Resource access denied'
                    )
                }

            serializer = PermissionResultSerializer(data=result)
            serializer.is_valid()
            return Response(serializer.data)

        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def my_permissions(self, request):
        """Get current user's permissions."""
        user = request.user
        permissions_data = user.get_role_permissions()
        serializer = UserPermissionsSerializer(data=permissions_data)
        serializer.is_valid()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def accessible_institutes(self, request):
        """Get institutes accessible to current user."""
        user = request.user
        institutes = user.get_accessible_institutes()

        institute_data = []
        for institute in institutes:
            access_data = {
                'institute_id': str(institute.id),
                'institute_name': institute.name,
                'has_access': True,
                'permissions': user.get_admin_permissions(),
                'assigned_roles': list(
                    user.admin_assignments.filter(
                        institute=institute, is_active=True
                    ).values_list('role__name', flat=True)
                )
            }
            institute_data.append(access_data)

        serializer = InstituteAccessSerializer(institute_data, many=True)
        return Response(serializer.data)


# Social Login Views


class FacebookLoginView(APIView):
    """
    Facebook OAuth2 login view.
    """
    permission_classes = [permissions.AllowAny]


class FacebookCallbackView(APIView):
    """
    Handle Facebook OAuth callback and return JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Get the access token from the request
            access_token = request.data.get('access_token')
            if not access_token:
                return Response(
                    {'error': 'Access token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create user from Facebook data
            user = self.get_or_create_user_from_facebook(access_token)

            if user:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)

                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Failed to authenticate with Facebook'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCallbackView(APIView):
    """
    Handle Google OAuth callback and return JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Get the access token from the request
            access_token = request.data.get('access_token')
            if not access_token:
                return Response(
                    {'error': 'Access token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create user from Google data
            user = self.get_or_create_user_from_google(access_token)

            if user:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)

                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Failed to authenticate with Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_or_create_user_from_facebook(self, access_token):
        """
        Get or create user from Facebook access token.
        """

        # Get user info from Facebook
        facebook_url = (
            f"https://graph.facebook.com/me?"
            f"fields=id,email,first_name,last_name,name&"
            f"access_token={access_token}"
        )
        response = requests.get(facebook_url)

        if response.status_code != 200:
            return None

        fb_data = response.json()

        # Check if user already exists
        try:
            social_account = SocialAccount.objects.get(
                provider='facebook',
                uid=fb_data['id']
            )
            return social_account.user
        except SocialAccount.DoesNotExist:
            # Create new user
            if not fb_data.get('email'):
                return None

            # Check if user with this email already exists
            try:
                user = User.objects.get(email=fb_data['email'])
                # Link the social account to existing user
                SocialAccount.objects.create(
                    user=user,
                    provider='facebook',
                    uid=fb_data['id'],
                    extra_data=fb_data
                )
                return user
            except User.DoesNotExist:
                # Create new user
                user = User.objects.create_user(
                    email=fb_data['email'],
                    first_name=fb_data.get('first_name', ''),
                    last_name=fb_data.get('last_name', ''),
                    username=fb_data['email'],
                    is_active=True,
                    email_verified=True
                )

                # Create social account
                SocialAccount.objects.create(
                    user=user,
                    provider='facebook',
                    uid=fb_data['id'],
                    extra_data=fb_data
                )

                return user

    def get_or_create_user_from_google(self, access_token):
        """
        Get or create user from Google access token.
        """

        # Get user info from Google
        google_url = (
            f"https://www.googleapis.com/oauth2/v2/userinfo?"
            f"access_token={access_token}"
        )
        response = requests.get(google_url)

        if response.status_code != 200:
            return None

        google_data = response.json()

        # Check if user already exists
        try:
            social_account = SocialAccount.objects.get(
                provider='google',
                uid=google_data['id']
            )
            return social_account.user
        except SocialAccount.DoesNotExist:
            # Create new user
            if not google_data.get('email'):
                return None

            # Check if user with this email already exists
            try:
                user = User.objects.get(email=google_data['email'])
                # Link the social account to existing user
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=google_data['id'],
                    extra_data=google_data
                )
                return user
            except User.DoesNotExist:
                # Create new user
                user = User.objects.create_user(
                    email=google_data['email'],
                    first_name=google_data.get('given_name', ''),
                    last_name=google_data.get('family_name', ''),
                    username=google_data['email'],
                    is_active=True,
                    email_verified=True
                )

                # Create social account
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=google_data['id'],
                    extra_data=google_data
                )

                return user
