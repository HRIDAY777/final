from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    Category, Author, Book, Borrowing, Reservation, Fine, LibrarySettings
)


class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'color', 'is_active',
            'book_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_book_count(self, obj):
        return obj.books.count()


class AuthorSerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = [
            'id', 'name', 'biography', 'email', 'website', 'birth_date',
            'is_active', 'book_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_book_count(self, obj):
        return obj.books.count()


class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    is_available = serializers.ReadOnlyField()
    borrowed_count = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'author', 'author_id', 'category', 'category_id',
            'publisher', 'publication_date', 'edition', 'pages', 'language',
            'description', 'cover_image', 'total_copies', 'available_copies',
            'location', 'status', 'price', 'is_active', 'is_available',
            'borrowed_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_available', 'borrowed_count']

    def validate(self, data):
        if 'available_copies' in data and 'total_copies' in data:
            if data['available_copies'] > data['total_copies']:
                raise ValidationError("Available copies cannot exceed total copies")
        return data


class BookListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'author', 'category', 'status',
            'available_copies', 'total_copies', 'is_available', 'created_at'
        ]


class BorrowingSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.IntegerField(write_only=True)
    borrower = serializers.StringRelatedField(read_only=True)
    borrower_id = serializers.IntegerField(write_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Borrowing
        fields = [
            'id', 'book', 'book_id', 'borrower', 'borrower_id', 'borrowed_date',
            'due_date', 'returned_date', 'status', 'notes', 'is_overdue',
            'days_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'borrowed_date', 'returned_date', 'created_at', 'updated_at',
            'is_overdue', 'days_overdue'
        ]

    def validate(self, data):
        if 'due_date' in data:
            if data['due_date'] <= timezone.now():
                raise ValidationError("Due date must be in the future")
        return data


class BorrowingListSerializer(serializers.ModelSerializer):
    book = serializers.StringRelatedField()
    borrower = serializers.StringRelatedField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Borrowing
        fields = [
            'id', 'book', 'borrower', 'borrowed_date', 'due_date',
            'status', 'is_overdue', 'created_at'
        ]


class ReservationSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.IntegerField(write_only=True)
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'book', 'book_id', 'user', 'user_id', 'reserved_date',
            'expiry_date', 'status', 'notes', 'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reserved_date', 'created_at', 'updated_at', 'is_expired'
        ]

    def validate(self, data):
        if 'expiry_date' in data:
            if data['expiry_date'] <= timezone.now():
                raise ValidationError("Expiry date must be in the future")
        return data


class ReservationListSerializer(serializers.ModelSerializer):
    book = serializers.StringRelatedField()
    user = serializers.StringRelatedField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'book', 'user', 'reserved_date', 'expiry_date',
            'status', 'is_expired', 'created_at'
        ]


class FineSerializer(serializers.ModelSerializer):
    borrowing = BorrowingSerializer(read_only=True)
    borrowing_id = serializers.IntegerField(write_only=True)
    waived_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Fine
        fields = [
            'id', 'borrowing', 'borrowing_id', 'amount', 'daily_rate',
            'status', 'paid_date', 'waived_by', 'waiver_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'amount', 'paid_date', 'waived_by', 'created_at', 'updated_at'
        ]


class FineListSerializer(serializers.ModelSerializer):
    borrowing = serializers.StringRelatedField()
    waived_by = serializers.StringRelatedField()

    class Meta:
        model = Fine
        fields = [
            'id', 'borrowing', 'amount', 'status', 'paid_date',
            'waived_by', 'created_at'
        ]


class LibrarySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibrarySettings
        fields = [
            'id', 'max_books_per_user', 'max_borrow_days', 'max_reservation_days',
            'daily_fine_rate', 'max_fine_amount', 'allow_reservations',
            'allow_fines', 'auto_calculate_fines', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Dashboard and Analytics Serializers
class LibraryDashboardSerializer(serializers.Serializer):
    total_books = serializers.IntegerField()
    total_authors = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    active_borrowings = serializers.IntegerField()
    overdue_borrowings = serializers.IntegerField()
    pending_reservations = serializers.IntegerField()
    pending_fines = serializers.IntegerField()
    total_fine_amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class BookAnalyticsSerializer(serializers.Serializer):
    book = BookSerializer()
    borrow_count = serializers.IntegerField()
    reservation_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    fine_amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class UserLibraryActivitySerializer(serializers.Serializer):
    user = serializers.StringRelatedField()
    total_borrowings = serializers.IntegerField()
    active_borrowings = serializers.IntegerField()
    overdue_borrowings = serializers.IntegerField()
    total_fines = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_fines = serializers.DecimalField(max_digits=10, decimal_places=2)


# Action Serializers
class BorrowBookSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    due_date = serializers.DateTimeField()

    def validate_book_id(self, value):
        try:
            book = Book.objects.get(id=value)
            if not book.is_available:
                raise ValidationError("Book is not available for borrowing")
        except Book.DoesNotExist:
            raise ValidationError("Book not found")
        return value

    def validate_due_date(self, value):
        if value <= timezone.now():
            raise ValidationError("Due date must be in the future")
        return value


class ReturnBookSerializer(serializers.Serializer):
    borrowing_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)


class ReserveBookSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    expiry_date = serializers.DateTimeField()

    def validate_book_id(self, value):
        try:
            book = Book.objects.get(id=value)
            if book.is_available:
                raise ValidationError("Book is available, no need to reserve")
        except Book.DoesNotExist:
            raise ValidationError("Book not found")
        return value

    def validate_expiry_date(self, value):
        if value <= timezone.now():
            raise ValidationError("Expiry date must be in the future")
        return value


class PayFineSerializer(serializers.Serializer):
    fine_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50, required=False)
    transaction_id = serializers.CharField(max_length=100, required=False)


class WaiveFineSerializer(serializers.Serializer):
    fine_id = serializers.IntegerField()
    reason = serializers.CharField(max_length=500, required=False)
