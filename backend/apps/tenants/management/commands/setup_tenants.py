"""
Management command to set up initial tenant data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.tenants.models import (
    Tenant, SubscriptionPlan, Module, PlanModule, 
    TenantModule, Subscription
)
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up initial tenant data including subscription plans and modules'

    def handle(self, *args, **options):
        self.stdout.write('Setting up multi-tenant system...')
        
        # Create subscription plans
        self.create_subscription_plans()
        
        # Create modules
        self.create_modules()
        
        # Link plans with modules
        self.link_plans_modules()
        
        # Create a default tenant
        self.create_default_tenant()
        
        self.stdout.write(
            self.style.SUCCESS('Multi-tenant system setup completed successfully!')
        )

    def create_subscription_plans(self):
        """Create default subscription plans"""
        plans_data = [
            {
                'name': 'Basic',
                'slug': 'basic',
                'plan_type': 'basic',
                'description': 'Perfect for small schools and training centers',
                'price_monthly': 29.99,
                'price_quarterly': 79.99,
                'price_yearly': 299.99,
                'max_students': 100,
                'max_teachers': 10,
                'max_storage_gb': 5,
                'trial_days': 14,
                'is_popular': False,
                'sort_order': 1,
            },
            {
                'name': 'Standard',
                'slug': 'standard',
                'plan_type': 'standard',
                'description': 'Ideal for medium-sized educational institutions',
                'price_monthly': 59.99,
                'price_quarterly': 159.99,
                'price_yearly': 599.99,
                'max_students': 500,
                'max_teachers': 25,
                'max_storage_gb': 20,
                'trial_days': 14,
                'is_popular': True,
                'sort_order': 2,
            },
            {
                'name': 'Premium',
                'slug': 'premium',
                'plan_type': 'premium',
                'description': 'Advanced features for large schools and colleges',
                'price_monthly': 99.99,
                'price_quarterly': 269.99,
                'price_yearly': 999.99,
                'max_students': 2000,
                'max_teachers': 100,
                'max_storage_gb': 50,
                'trial_days': 14,
                'is_popular': False,
                'sort_order': 3,
            },
            {
                'name': 'Enterprise',
                'slug': 'enterprise',
                'plan_type': 'enterprise',
                'description': 'Custom solutions for universities and large institutions',
                'price_monthly': 199.99,
                'price_quarterly': 539.99,
                'price_yearly': 1999.99,
                'max_students': 10000,
                'max_teachers': 500,
                'max_storage_gb': 100,
                'trial_days': 30,
                'is_popular': False,
                'sort_order': 4,
            },
        ]
        
        for plan_data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(f'Created subscription plan: {plan.name}')
            else:
                self.stdout.write(f'Subscription plan already exists: {plan.name}')

    def create_modules(self):
        """Create available modules"""
        modules_data = [
            # Core modules
            {
                'name': 'Student Management',
                'slug': 'student-management',
                'category': 'core',
                'description': 'Manage student profiles, enrollment, and academic records',
                'icon': 'users',
                'color': '#3B82F6',
                'is_core': True,
                'sort_order': 1,
            },
            {
                'name': 'Teacher Management',
                'slug': 'teacher-management',
                'category': 'core',
                'description': 'Staff profiles, qualifications, and performance tracking',
                'icon': 'graduation-cap',
                'color': '#10B981',
                'is_core': True,
                'sort_order': 2,
            },
            {
                'name': 'Attendance System',
                'slug': 'attendance-system',
                'category': 'core',
                'description': 'Real-time attendance tracking for students and staff',
                'icon': 'clock',
                'color': '#F59E0B',
                'is_core': True,
                'sort_order': 3,
            },
            {
                'name': 'Exam & Results',
                'slug': 'exam-results',
                'category': 'academic',
                'description': 'Comprehensive examination and grading system',
                'icon': 'file-text',
                'color': '#EF4444',
                'is_core': True,
                'sort_order': 4,
            },
            {
                'name': 'Finance & Fees',
                'slug': 'finance-fees',
                'category': 'finance',
                'description': 'Fee collection, invoicing, and financial reports',
                'icon': 'credit-card',
                'color': '#8B5CF6',
                'is_core': False,
                'sort_order': 5,
            },
            {
                'name': 'Classes & Subjects',
                'slug': 'classes-subjects',
                'category': 'academic',
                'description': 'Course management and scheduling',
                'icon': 'book-open',
                'color': '#06B6D4',
                'is_core': True,
                'sort_order': 6,
            },
            {
                'name': 'Library Management',
                'slug': 'library-management',
                'category': 'library',
                'description': 'Book inventory, issue/return tracking',
                'icon': 'library',
                'color': '#84CC16',
                'is_core': False,
                'sort_order': 7,
            },
            {
                'name': 'Transport System',
                'slug': 'transport-system',
                'category': 'transport',
                'description': 'Bus routes, driver management, tracking',
                'icon': 'truck',
                'color': '#F97316',
                'is_core': False,
                'sort_order': 8,
            },
            {
                'name': 'Hostel Management',
                'slug': 'hostel-management',
                'category': 'hostel',
                'description': 'Room allocation, fees, and maintenance',
                'icon': 'home',
                'color': '#EC4899',
                'is_core': False,
                'sort_order': 9,
            },
            {
                'name': 'Inventory Control',
                'slug': 'inventory-control',
                'category': 'administrative',
                'description': 'Asset tracking and supply management',
                'icon': 'package',
                'color': '#6B7280',
                'is_core': False,
                'sort_order': 10,
            },
            {
                'name': 'HR & Payroll',
                'slug': 'hr-payroll',
                'category': 'administrative',
                'description': 'Staff management and payroll processing',
                'icon': 'briefcase',
                'color': '#059669',
                'is_core': False,
                'sort_order': 11,
            },
            {
                'name': 'Timetable',
                'slug': 'timetable',
                'category': 'academic',
                'description': 'Automated scheduling and time tables',
                'icon': 'calendar',
                'color': '#DC2626',
                'is_core': True,
                'sort_order': 12,
            },
            {
                'name': 'E-commerce',
                'slug': 'ecommerce',
                'category': 'extracurricular',
                'description': 'Online store for school supplies and merchandise',
                'icon': 'shopping-cart',
                'color': '#7C3AED',
                'is_core': False,
                'sort_order': 13,
            },
            {
                'name': 'E-learning',
                'slug': 'elearning',
                'category': 'academic',
                'description': 'Online learning platform and course management',
                'icon': 'play',
                'color': '#0891B2',
                'is_core': False,
                'sort_order': 14,
            },
        ]
        
        for module_data in modules_data:
            module, created = Module.objects.get_or_create(
                slug=module_data['slug'],
                defaults=module_data
            )
            if created:
                self.stdout.write(f'Created module: {module.name}')
            else:
                self.stdout.write(f'Module already exists: {module.name}')

    def link_plans_modules(self):
        """Link subscription plans with modules"""
        # Get plans and modules
        basic_plan = SubscriptionPlan.objects.get(slug='basic')
        standard_plan = SubscriptionPlan.objects.get(slug='standard')
        premium_plan = SubscriptionPlan.objects.get(slug='premium')
        enterprise_plan = SubscriptionPlan.objects.get(slug='enterprise')
        
        # Basic plan modules (core only)
        basic_modules = [
            'student-management', 'teacher-management', 'attendance-system',
            'exam-results', 'classes-subjects', 'timetable'
        ]
        
        # Standard plan modules (core + some additional)
        standard_modules = basic_modules + [
            'finance-fees', 'library-management'
        ]
        
        # Premium plan modules (most modules)
        premium_modules = standard_modules + [
            'transport-system', 'hostel-management', 'inventory-control',
            'hr-payroll', 'elearning'
        ]
        
        # Enterprise plan modules (all modules)
        enterprise_modules = premium_modules + [
            'ecommerce'
        ]
        
        # Create plan-module relationships
        plan_modules = {
            basic_plan: basic_modules,
            standard_plan: standard_modules,
            premium_plan: premium_modules,
            enterprise_plan: enterprise_modules,
        }
        
        for plan, module_slugs in plan_modules.items():
            for slug in module_slugs:
                try:
                    module = Module.objects.get(slug=slug)
                    plan_module, created = PlanModule.objects.get_or_create(
                        plan=plan,
                        module=module,
                        defaults={'is_included': True}
                    )
                    if created:
                        self.stdout.write(f'Linked {module.name} to {plan.name}')
                except Module.DoesNotExist:
                    self.stdout.write(f'Module {slug} not found')

    def create_default_tenant(self):
        """Create a default tenant for testing"""
        try:
            # Get or create admin user
            admin_user, created = User.objects.get_or_create(
                email='admin@gmail.com',
                defaults={
                    'username': 'admin',
                    'first_name': 'MD',
                    'last_name': 'HRIDAY',
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            
            # Create default tenant
            tenant, created = Tenant.objects.get_or_create(
                slug='demo-school',
                defaults={
                    'name': 'Demo School',
                    'domain': 'demo.educore.com',
                    'subdomain': 'demo',
                    'tenant_type': 'school',
                    'description': 'Demo school for testing the system',
                    'email': 'admin@demo.educore.com',
                    'phone': '+1234567890',
                    'address': '123 Demo Street',
                    'city': 'Demo City',
                    'state': 'Demo State',
                    'country': 'Demo Country',
                    'postal_code': '12345',
                    'subscription_status': 'trial',
                    'trial_ends_at': timezone.now() + timedelta(days=30),
                    'max_students': 500,
                    'max_teachers': 25,
                    'max_storage_gb': 20,
                    'timezone': 'UTC',
                    'language': 'en',
                    'currency': 'USD',
                    'created_by': admin_user,
                }
            )
            
            if created:
                self.stdout.write(f'Created default tenant: {tenant.name}')
                
                # Enable modules for the tenant
                standard_plan = SubscriptionPlan.objects.get(slug='standard')
                tenant.subscription_plan = standard_plan
                tenant.save()
                
                # Enable modules based on the standard plan
                for plan_module in standard_plan.plan_modules.filter(is_included=True):
                    tenant_module, created = TenantModule.objects.get_or_create(
                        tenant=tenant,
                        module=plan_module.module,
                        defaults={
                            'is_enabled': True,
                            'is_limited': plan_module.is_limited,
                            'limit_value': plan_module.limit_value,
                        }
                    )
                    if created:
                        self.stdout.write(f'Enabled {plan_module.module.name} for {tenant.name}')
            else:
                self.stdout.write(f'Default tenant already exists: {tenant.name}')
                
        except Exception as e:
            self.stdout.write(f'Error creating default tenant: {str(e)}')
