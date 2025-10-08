"""
User models for authentication and user management.
"""

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email address must be set")
        email = self.normalize_email(email)
        # Ensure username exists for AbstractUser compatibility
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model with extended fields for educational institutions.
    """
    # Basic Information
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=15, blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: "
                        "'+999999999'. Up to 15 digits allowed."
            )
        ]
    )

    # Profile Information
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', blank=True, null=True
    )
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(
        max_length=10,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
        ],
        blank=True
    )

    # Address Information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # User Type and Role
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('super_admin', 'Super Administrator'),
            ('admin', 'Administrator'),
            ('institute_admin', 'Institute Administrator'),
            ('teacher', 'Teacher'),
            ('student', 'Student'),
            ('parent', 'Parent'),
            ('staff', 'Staff'),
        ],
        default='student'
    )

    # Multi-tenant support
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('Tenant')
    )

    # Admin Hierarchy and Permissions
    admin_level = models.CharField(
        max_length=20,
        choices=[
            ('super_admin', 'Super Administrator'),
            ('system_admin', 'System Administrator'),
            ('institute_admin', 'Institute Administrator'),
            ('department_admin', 'Department Administrator'),
            ('faculty_admin', 'Faculty Administrator'),
            ('none', 'No Admin Rights'),
        ],
        default='none'
    )

    # Admin Permissions
    can_manage_users = models.BooleanField(default=False)
    can_manage_admins = models.BooleanField(default=False)
    can_manage_institutes = models.BooleanField(default=False)
    can_manage_tenants = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    can_manage_billing = models.BooleanField(default=False)
    can_manage_security = models.BooleanField(default=False)

    # Admin Scope
    admin_institutes = models.ManyToManyField(
        'tenants.Tenant',
        blank=True,
        related_name='administered_by',
        verbose_name=_('Institutes Administered')
    )

    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    # Security
    mfa_enabled = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)

    # Preferences
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    notification_preferences = models.JSONField(default=dict)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(blank=True, null=True)

    # Override username field
    username = models.CharField(
        max_length=150, unique=True, blank=True, null=True
    )

    # Managers
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the full name of the user."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

    def is_locked(self):
        """Check if user account is locked."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def increment_failed_attempts(self):
        """Increment failed login attempts."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=30)
        self.save()

    def reset_failed_attempts(self):
        """Reset failed login attempts."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()

    def update_last_activity(self):
        """Update last activity timestamp."""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])

    # Admin Methods
    def is_super_admin(self):
        """Check if user is a super administrator."""
        return (self.admin_level == 'super_admin' or
                self.user_type == 'super_admin')

    def is_system_admin(self):
        """Check if user is a system administrator."""
        return self.admin_level == 'system_admin' or self.user_type == 'admin'

    def is_institute_admin(self):
        """Check if user is an institute administrator."""
        return (self.admin_level == 'institute_admin' or
                self.user_type == 'institute_admin')

    def is_admin(self):
        """Check if user has any admin rights."""
        return (self.admin_level != 'none' or
                self.user_type in ['super_admin', 'admin', 'institute_admin'])

    def can_administer_institute(self, institute):
        """Check if user can administer a specific institute."""
        if self.is_super_admin():
            return True
        if self.is_system_admin():
            return True
        if self.is_institute_admin():
            institutes = self.admin_institutes.all()
            return institute in institutes
        return False

    def get_admin_permissions(self):
        """Get list of admin permissions."""
        permissions = []
        if self.can_manage_users:
            permissions.append('manage_users')
        if self.can_manage_admins:
            permissions.append('manage_admins')
        if self.can_manage_institutes:
            permissions.append('manage_institutes')
        if self.can_manage_tenants:
            permissions.append('manage_tenants')
        if self.can_view_analytics:
            permissions.append('view_analytics')
        if self.can_manage_settings:
            permissions.append('manage_settings')
        if self.can_manage_billing:
            permissions.append('manage_billing')
        if self.can_manage_security:
            permissions.append('manage_security')
        return permissions

    def set_admin_level(self, level, permissions=None):
        """Set admin level and permissions."""
        self.admin_level = level

        # Set default permissions based on level
        if level == 'super_admin':
            self.can_manage_users = True
            self.can_manage_admins = True
            self.can_manage_institutes = True
            self.can_manage_tenants = True
            self.can_view_analytics = True
            self.can_manage_settings = True
            self.can_manage_billing = True
            self.can_manage_security = True
        elif level == 'system_admin':
            self.can_manage_users = True
            self.can_manage_admins = False
            self.can_manage_institutes = True
            self.can_manage_tenants = False
            self.can_view_analytics = True
            self.can_manage_settings = True
            self.can_manage_billing = True
            self.can_manage_security = False
        elif level == 'institute_admin':
            self.can_manage_users = True
            self.can_manage_admins = False
            self.can_manage_institutes = False
            self.can_manage_tenants = False
            self.can_view_analytics = True
            self.can_manage_settings = False
            self.can_manage_billing = False
            self.can_manage_security = False
        elif level == 'department_admin':
            self.can_manage_users = True
            self.can_manage_admins = False
            self.can_manage_institutes = False
            self.can_manage_tenants = False
            self.can_view_analytics = True
            self.can_manage_settings = False
            self.can_manage_billing = False
            self.can_manage_security = False
        else:
            # Reset all permissions
            self.can_manage_users = False
            self.can_manage_admins = False
            self.can_manage_institutes = False
            self.can_manage_tenants = False
            self.can_view_analytics = False
            self.can_manage_settings = False
            self.can_manage_billing = False
            self.can_manage_security = False

        # Override with custom permissions if provided
        if permissions:
            for permission, value in permissions.items():
                if hasattr(self, permission):
                    setattr(self, permission, value)

        self.save()

    # RBAC Methods
    def has_permission(self, permission):
        """Check if user has a specific permission."""
        # Super admins have all permissions
        if self.is_super_admin():
            return True

        # Check specific permission
        permission_map = {
            'manage_users': self.can_manage_users,
            'manage_admins': self.can_manage_admins,
            'manage_institutes': self.can_manage_institutes,
            'manage_tenants': self.can_manage_tenants,
            'view_analytics': self.can_view_analytics,
            'manage_settings': self.can_manage_settings,
            'manage_billing': self.can_manage_billing,
            'manage_security': self.can_manage_security,
        }

        return permission_map.get(permission, False)

    def has_resource_permission(self, resource, action):
        """Check if user can perform action on resource."""
        # Super admins have access to all resources
        if self.is_super_admin():
            return True

        # Map resources to permissions
        resource_permissions = {
            'users': {
                'create': self.can_manage_users,
                'read': self.can_manage_users,
                'update': self.can_manage_users,
                'delete': self.can_manage_users,
            },
            'admins': {
                'create': self.can_manage_admins,
                'read': self.can_manage_admins,
                'update': self.can_manage_admins,
                'delete': self.can_manage_admins,
            },
            'institutes': {
                'create': self.can_manage_institutes,
                'read': self.can_manage_institutes,
                'update': self.can_manage_institutes,
                'delete': self.can_manage_institutes,
            },
            'analytics': {
                'read': self.can_view_analytics,
            },
            'settings': {
                'create': self.can_manage_settings,
                'read': self.can_manage_settings,
                'update': self.can_manage_settings,
                'delete': self.can_manage_settings,
            },
            'billing': {
                'create': self.can_manage_billing,
                'read': self.can_manage_billing,
                'update': self.can_manage_billing,
                'delete': self.can_manage_billing,
            },
            'security': {
                'create': self.can_manage_security,
                'read': self.can_manage_security,
                'update': self.can_manage_security,
                'delete': self.can_manage_security,
            },
        }

        resource_perms = resource_permissions.get(resource, {})
        return resource_perms.get(action, False)

    def can_access_resource(self, resource, action, resource_id=None,
                            institute_id=None):
        """Check if user can access specific resource with context."""
        # Basic permission check
        if not self.has_resource_permission(resource, action):
            return False

        # Institute-level access check
        if institute_id and self.is_institute_admin():
            institutes = self.admin_institutes.values_list('id', flat=True)
            if institute_id not in institutes:
                return False

        # Resource-specific checks
        if resource == 'users' and resource_id:
            # Users can always access their own data
            if str(resource_id) == str(self.id):
                return True

            # Institute admins can only access users in their institutes
            if self.is_institute_admin():
                try:
                    target_user = User.objects.get(id=resource_id)
                    return target_user.tenant in self.admin_institutes.all()
                except User.DoesNotExist:
                    return False

        return True

    def get_accessible_institutes(self):
        """Get list of institutes user can access."""
        if self.is_super_admin():
            from apps.tenants.models import Tenant
            return Tenant.objects.all()
        elif self.is_system_admin():
            from apps.tenants.models import Tenant
            return Tenant.objects.all()
        elif self.is_institute_admin():
            return self.admin_institutes.all()
        return []

    def get_role_permissions(self):
        """Get comprehensive role permissions."""
        permissions = {
            'user_type': self.user_type,
            'admin_level': self.admin_level,
            'permissions': self.get_admin_permissions(),
            'institutes': list(
                self.admin_institutes.values_list('id', flat=True)
            ),
            'is_super_admin': self.is_super_admin(),
            'is_system_admin': self.is_system_admin(),
            'is_institute_admin': self.is_institute_admin(),
            'is_admin': self.is_admin(),
        }
        return permissions

    def assign_admin_role(self, role, institute=None, assigned_by=None,
                          expires_at=None):
        """Assign an admin role to the user."""
        from .models import AdminAssignment

        assignment = AdminAssignment.objects.create(
            user=self,
            role=role,
            institute=institute,
            assigned_by=assigned_by or self,
            expires_at=expires_at,
            is_active=True
        )

        # Update user permissions based on role
        self.can_manage_users = (self.can_manage_users or
                                 role.can_manage_users)
        self.can_manage_admins = (self.can_manage_admins or
                                  role.can_manage_admins)
        self.can_manage_institutes = (self.can_manage_institutes or
                                      role.can_manage_institutes)
        self.can_manage_tenants = (self.can_manage_tenants or
                                   role.can_manage_tenants)
        self.can_view_analytics = (self.can_view_analytics or
                                   role.can_view_analytics)
        self.can_manage_settings = (self.can_manage_settings or
                                    role.can_manage_settings)
        self.can_manage_billing = (self.can_manage_billing or
                                   role.can_manage_billing)
        self.can_manage_security = (self.can_manage_security or
                                    role.can_manage_security)

        self.save()
        return assignment

    def remove_admin_role(self, role, institute=None):
        """Remove an admin role assignment."""
        from .models import AdminAssignment

        try:
            assignment = AdminAssignment.objects.get(
                user=self,
                role=role,
                institute=institute,
                is_active=True
            )
            assignment.is_active = False
            assignment.save()

            # Recalculate permissions based on remaining active assignments
            self._recalculate_permissions()
            return True
        except AdminAssignment.DoesNotExist:
            return False

    def _recalculate_permissions(self):
        """Recalculate user permissions based on active role assignments."""
        from .models import AdminAssignment

        # Reset permissions
        self.can_manage_users = False
        self.can_manage_admins = False
        self.can_manage_institutes = False
        self.can_manage_tenants = False
        self.can_view_analytics = False
        self.can_manage_settings = False
        self.can_manage_billing = False
        self.can_manage_security = False

        # Get active assignments
        active_assignments = AdminAssignment.objects.filter(
            user=self,
            is_active=True
        ).select_related('role')

        # Aggregate permissions from all active roles
        for assignment in active_assignments:
            if assignment.is_valid():
                role = assignment.role
                self.can_manage_users = (self.can_manage_users or
                                         role.can_manage_users)
                self.can_manage_admins = (self.can_manage_admins or
                                          role.can_manage_admins)
                self.can_manage_institutes = (self.can_manage_institutes or
                                              role.can_manage_institutes)
                self.can_manage_tenants = (self.can_manage_tenants or
                                           role.can_manage_tenants)
                self.can_view_analytics = (self.can_view_analytics or
                                           role.can_view_analytics)
                self.can_manage_settings = (self.can_manage_settings or
                                            role.can_manage_settings)
                self.can_manage_billing = (self.can_manage_billing or
                                           role.can_manage_billing)
                self.can_manage_security = (self.can_manage_security or
                                            role.can_manage_security)

        self.save()


class UserProfile(models.Model):
    """
    Extended user profile with additional information.
    """
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )

    # Academic Information (for students/teachers)
    student_id = models.CharField(max_length=50, blank=True)
    teacher_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=100, blank=True)

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(
        max_length=50, blank=True
    )

    # Social Media
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)

    # Additional Information
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)

    # Privacy Settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
            ('friends', 'Friends Only'),
        ],
        default='public'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile of {self.user.get_full_name()}"


class UserSession(models.Model):
    """
    Track user sessions for security and analytics.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sessions'
    )
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'

    def __str__(self):
        return f"Session for {self.user.email}"


class AuditLog(models.Model):
    """
    Audit log for tracking user actions.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='audit_logs'
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=50, blank=True)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.action} at {self.timestamp}"


class AdminRole(models.Model):
    """
    Predefined admin roles with specific permissions.
    """
    ROLE_TYPES = [
        ('super_admin', 'Super Administrator'),
        ('system_admin', 'System Administrator'),
        ('institute_admin', 'Institute Administrator'),
        ('department_admin', 'Department Administrator'),
        ('faculty_admin', 'Faculty Administrator'),
        ('custom', 'Custom Role'),
    ]

    name = models.CharField(max_length=100, unique=True)
    role_type = models.CharField(max_length=20, choices=ROLE_TYPES)
    description = models.TextField(blank=True)

    # Permissions
    can_manage_users = models.BooleanField(default=False)
    can_manage_admins = models.BooleanField(default=False)
    can_manage_institutes = models.BooleanField(default=False)
    can_manage_tenants = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    can_manage_billing = models.BooleanField(default=False)
    can_manage_security = models.BooleanField(default=False)

    # Scope
    applicable_institutes = models.ManyToManyField(
        'tenants.Tenant',
        blank=True,
        related_name='admin_roles',
        verbose_name=_('Applicable Institutes')
    )

    # Metadata
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_admin_roles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Admin Role'
        verbose_name_plural = 'Admin Roles'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_role_type_display()})"

    def get_permissions(self):
        """Get list of permissions for this role."""
        permissions = []
        if self.can_manage_users:
            permissions.append('manage_users')
        if self.can_manage_admins:
            permissions.append('manage_admins')
        if self.can_manage_institutes:
            permissions.append('manage_institutes')
        if self.can_manage_tenants:
            permissions.append('manage_tenants')
        if self.can_view_analytics:
            permissions.append('view_analytics')
        if self.can_manage_settings:
            permissions.append('manage_settings')
        if self.can_manage_billing:
            permissions.append('manage_billing')
        if self.can_manage_security:
            permissions.append('manage_security')
        return permissions


class AdminAssignment(models.Model):
    """
    Track admin role assignments to users.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='admin_assignments'
    )
    role = models.ForeignKey(
        AdminRole,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    institute = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='admin_assignments',
        null=True,
        blank=True
    )

    # Assignment details
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='admin_assignments_given'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Admin Assignment'
        verbose_name_plural = 'Admin Assignments'
        unique_together = ['user', 'role', 'institute']
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"

    def is_expired(self):
        """Check if assignment has expired."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def is_valid(self):
        """Check if assignment is valid and active."""
        return self.is_active and not self.is_expired()
