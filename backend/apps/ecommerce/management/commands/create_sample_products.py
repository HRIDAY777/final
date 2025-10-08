from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.ecommerce.models import Product, Cart


User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample products for the ecommerce shop'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample products...')
        
        # Sample products data
        products_data = [
            {
                'name': 'Mathematics Textbook - Class 10',
                'sku': 'MATH-10-001',
                'category': 'Books',
                'price': 450.00,
                'stock': 50,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Math+Book'
                )
            },
            {
                'name': 'Science Lab Manual',
                'sku': 'SCI-10-002',
                'category': 'Books',
                'price': 280.00,
                'stock': 30,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Science+Manual'
                )
            },
            {
                'name': 'Premium Ballpoint Pen Set',
                'sku': 'PEN-001',
                'category': 'Stationery',
                'price': 120.00,
                'stock': 100,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Pen+Set'
                )
            },
            {
                'name': 'A4 Notebook - 200 Pages',
                'sku': 'NOTE-001',
                'category': 'Stationery',
                'price': 85.00,
                'stock': 200,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Notebook'
                )
            },
            {
                'name': 'Scientific Calculator',
                'sku': 'CALC-001',
                'category': 'Electronics',
                'price': 850.00,
                'stock': 25,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Calculator'
                )
            },
            {
                'name': 'School Uniform - Boys',
                'sku': 'UNI-B-001',
                'category': 'Uniforms',
                'price': 650.00,
                'stock': 75,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Uniform+Boys'
                )
            },
            {
                'name': 'School Uniform - Girls',
                'sku': 'UNI-G-001',
                'category': 'Uniforms',
                'price': 680.00,
                'stock': 75,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Uniform+Girls'
                )
            },
            {
                'name': 'Football',
                'sku': 'SPORT-001',
                'category': 'Sports',
                'price': 350.00,
                'stock': 40,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Football'
                )
            },
            {
                'name': 'Art Paint Set',
                'sku': 'ART-001',
                'category': 'Art Supplies',
                'price': 420.00,
                'stock': 35,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Paint+Set'
                )
            },
            {
                'name': 'Pencil Set - 12 Colors',
                'sku': 'ART-002',
                'category': 'Art Supplies',
                'price': 95.00,
                'stock': 60,
                'image_url': (
                    'https://via.placeholder.com/300x200?text=Pencil+Set'
                )
            }
        ]
        
        created_count = 0
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'Created product: {product.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} sample products!'
            )
        )
        
        # Create cart for admin user if it doesn't exist
        try:
            admin_user = User.objects.get(email='admin@educore.com')
            cart, created = Cart.objects.get_or_create(user=admin_user)
            if created:
                self.stdout.write('Created cart for admin user')
        except User.DoesNotExist:
            self.stdout.write('Admin user not found, skipping cart creation')
