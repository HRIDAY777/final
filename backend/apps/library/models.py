from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django_tenants.utils import tenant_context
from apps.students.models import Student
from apps.teachers.models import Teacher

User = get_user_model()


class Category(models.Model):
    """Book category model"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex color code")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['name']

    def __str__(self):
        return self.name


class Author(models.Model):
    """Book author model"""
    name = models.CharField(max_length=200)
    biography = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Author")
        verbose_name_plural = _("Authors")
        ordering = ['name']

    def __str__(self):
        return self.name


class Book(models.Model):
    """Book model"""
    STATUS_CHOICES = [
        ('available', _('Available')),
        ('borrowed', _('Borrowed')),
        ('reserved', _('Reserved')),
        ('maintenance', _('Under Maintenance')),
        ('lost', _('Lost')),
    ]

    title = models.CharField(max_length=300)
    isbn = models.CharField(max_length=13, unique=True, blank=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='books')
    publisher = models.CharField(max_length=200, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    edition = models.CharField(max_length=50, blank=True)
    pages = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(max_length=50, default='English')
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='books/covers/', blank=True, null=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=100, blank=True, help_text="Shelf location")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Book")
        verbose_name_plural = _("Books")
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author.name}"

    def clean(self):
        if self.available_copies > self.total_copies:
            raise ValidationError(_("Available copies cannot exceed total copies"))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_available(self):
        return self.available_copies > 0 and self.status == 'available'

    @property
    def borrowed_count(self):
        return self.total_copies - self.available_copies


class Borrowing(models.Model):
    """Book borrowing model"""
    STATUS_CHOICES = [
        ('borrowed', _('Borrowed')),
        ('returned', _('Returned')),
        ('overdue', _('Overdue')),
        ('lost', _('Lost')),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowings')
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowings')
    borrowed_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Borrowing")
        verbose_name_plural = _("Borrowings")
        ordering = ['-borrowed_date']

    def __str__(self):
        return f"{self.book.title} - {self.borrower.get_full_name()}"

    def clean(self):
        if self.due_date <= self.borrowed_date:
            raise ValidationError(_("Due date must be after borrowed date"))

    def save(self, *args, **kwargs):
        if not self.pk:  # New borrowing
            # Update book availability
            self.book.available_copies -= 1
            if self.book.available_copies == 0:
                self.book.status = 'borrowed'
            self.book.save()
        
        # Check if overdue
        if self.status == 'borrowed' and timezone.now() > self.due_date:
            self.status = 'overdue'
        
        super().save(*args, **kwargs)

    def return_book(self):
        """Return the borrowed book"""
        self.status = 'returned'
        self.returned_date = timezone.now()
        self.save()
        
        # Update book availability
        self.book.available_copies += 1
        if self.book.status == 'borrowed':
            self.book.status = 'available'
        self.book.save()

    @property
    def is_overdue(self):
        return self.status == 'borrowed' and timezone.now() > self.due_date

    @property
    def days_overdue(self):
        if self.is_overdue:
            return (timezone.now() - self.due_date).days
        return 0


class Reservation(models.Model):
    """Book reservation model"""
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('fulfilled', _('Fulfilled')),
        ('cancelled', _('Cancelled')),
        ('expired', _('Expired')),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    reserved_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Reservation")
        verbose_name_plural = _("Reservations")
        ordering = ['-reserved_date']

    def __str__(self):
        return f"{self.book.title} - {self.user.get_full_name()}"

    def clean(self):
        if self.expiry_date <= self.reserved_date:
            raise ValidationError(_("Expiry date must be after reserved date"))

    def save(self, *args, **kwargs):
        self.clean()
        
        # Check if expired
        if self.status == 'pending' and timezone.now() > self.expiry_date:
            self.status = 'expired'
        
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.status == 'pending' and timezone.now() > self.expiry_date


class Fine(models.Model):
    """Fine model for overdue books"""
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('waived', _('Waived')),
    ]

    borrowing = models.OneToOneField(Borrowing, on_delete=models.CASCADE, related_name='fine')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    daily_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_date = models.DateTimeField(null=True, blank=True)
    waived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='waived_fines')
    waiver_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Fine")
        verbose_name_plural = _("Fines")
        ordering = ['-created_at']

    def __str__(self):
        return f"Fine for {self.borrowing.book.title} - {self.borrowing.borrower.get_full_name()}"

    def calculate_fine(self):
        """Calculate fine amount based on overdue days"""
        if self.borrowing.is_overdue:
            overdue_days = self.borrowing.days_overdue
            return overdue_days * self.daily_rate
        return 0

    def save(self, *args, **kwargs):
        if not self.pk:  # New fine
            self.amount = self.calculate_fine()
        super().save(*args, **kwargs)

    def pay_fine(self):
        """Mark fine as paid"""
        self.status = 'paid'
        self.paid_date = timezone.now()
        self.save()

    def waive_fine(self, waived_by, reason=""):
        """Waive the fine"""
        self.status = 'waived'
        self.waived_by = waived_by
        self.waiver_reason = reason
        self.save()


class LibrarySettings(models.Model):
    """Library settings model"""
    max_books_per_user = models.PositiveIntegerField(default=5)
    max_borrow_days = models.PositiveIntegerField(default=14)
    max_reservation_days = models.PositiveIntegerField(default=7)
    daily_fine_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    max_fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    allow_reservations = models.BooleanField(default=True)
    allow_fines = models.BooleanField(default=True)
    auto_calculate_fines = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Library Setting")
        verbose_name_plural = _("Library Settings")

    def __str__(self):
        return "Library Settings"

    def save(self, *args, **kwargs):
        # Ensure only one settings instance
        if not self.pk and LibrarySettings.objects.exists():
            return
        super().save(*args, **kwargs)
