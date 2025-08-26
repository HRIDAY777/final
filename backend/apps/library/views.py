from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from datetime import timedelta

from .models import (
    Category, Author, Book, Borrowing, Reservation, Fine, LibrarySettings
)
from .serializers import (
    CategorySerializer, AuthorSerializer, BookSerializer, BookListSerializer,
    BorrowingSerializer, BorrowingListSerializer, ReservationSerializer,
    ReservationListSerializer, FineSerializer, FineListSerializer,
    LibrarySettingsSerializer, LibraryDashboardSerializer,
    BookAnalyticsSerializer, UserLibraryActivitySerializer,
    BorrowBookSerializer, ReturnBookSerializer, ReserveBookSerializer,
    PayFineSerializer, WaiveFineSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CategorySerializer
        return CategorySerializer

    @action(detail=True, methods=['get'])
    def books(self, request, pk=None):
        """Get all books in a category"""
        category = self.get_object()
        books = category.books.all()
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active categories"""
        categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'biography', 'email']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def books(self, request, pk=None):
        """Get all books by an author"""
        author = self.get_object()
        books = author.books.all()
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular authors by book count"""
        authors = self.queryset.annotate(
            book_count=Count('books')
        ).filter(book_count__gt=0).order_by('-book_count')[:10]
        serializer = self.get_serializer(authors, many=True)
        return Response(serializer.data)


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'author', 'language', 'is_active']
    search_fields = ['title', 'isbn', 'author__name', 'publisher']
    ordering_fields = ['title', 'created_at', 'available_copies']
    ordering = ['title']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available books"""
        books = self.queryset.filter(is_available=True)
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular books by borrowing count"""
        books = self.queryset.annotate(
            borrow_count=Count('borrowings')
        ).filter(borrow_count__gt=0).order_by('-borrow_count')[:10]
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def borrowings(self, request, pk=None):
        """Get all borrowings for a book"""
        book = self.get_object()
        borrowings = book.borrowings.all()
        serializer = BorrowingListSerializer(borrowings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reservations(self, request, pk=None):
        """Get all reservations for a book"""
        book = self.get_object()
        reservations = book.reservations.all()
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def borrow(self, request, pk=None):
        """Borrow a book"""
        book = self.get_object()
        serializer = BorrowBookSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Check if user can borrow more books
                settings = LibrarySettings.objects.first()
                if settings:
                    user_borrowings = Borrowing.objects.filter(
                        borrower=request.user,
                        status__in=['borrowed', 'overdue']
                    ).count()
                    if user_borrowings >= settings.max_books_per_user:
                        return Response(
                            {"error": "You have reached the maximum number of books you can borrow"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Create borrowing
                borrowing = Borrowing.objects.create(
                    book=book,
                    borrower=request.user,
                    due_date=serializer.validated_data['due_date']
                )
                
                return Response(
                    {"message": "Book borrowed successfully", "borrowing_id": borrowing.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reserve(self, request, pk=None):
        """Reserve a book"""
        book = self.get_object()
        serializer = ReserveBookSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Check if user already has a reservation for this book
                existing_reservation = Reservation.objects.filter(
                    book=book,
                    user=request.user,
                    status='pending'
                ).first()
                
                if existing_reservation:
                    return Response(
                        {"error": "You already have a pending reservation for this book"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create reservation
                reservation = Reservation.objects.create(
                    book=book,
                    user=request.user,
                    expiry_date=serializer.validated_data['expiry_date']
                )
                
                return Response(
                    {"message": "Book reserved successfully", "reservation_id": reservation.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BorrowingViewSet(viewsets.ModelViewSet):
    queryset = Borrowing.objects.all()
    serializer_class = BorrowingSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'book__category', 'borrower']
    search_fields = ['book__title', 'borrower__first_name', 'borrower__last_name']
    ordering_fields = ['borrowed_date', 'due_date', 'returned_date']
    ordering = ['-borrowed_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return BorrowingListSerializer
        return BorrowingSerializer

    def get_queryset(self):
        """Filter borrowings based on user role"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Regular users can only see their own borrowings
            queryset = queryset.filter(borrower=self.request.user)
        return queryset

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue borrowings"""
        borrowings = self.get_queryset().filter(status='overdue')
        serializer = BorrowingListSerializer(borrowings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active borrowings (borrowed or overdue)"""
        borrowings = self.get_queryset().filter(status__in=['borrowed', 'overdue'])
        serializer = BorrowingListSerializer(borrowings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        """Return a borrowed book"""
        borrowing = self.get_object()
        serializer = ReturnBookSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                borrowing.return_book()
                if serializer.validated_data.get('notes'):
                    borrowing.notes = serializer.validated_data['notes']
                    borrowing.save()
                
                return Response(
                    {"message": "Book returned successfully"},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'book__category', 'user']
    search_fields = ['book__title', 'user__first_name', 'user__last_name']
    ordering_fields = ['reserved_date', 'expiry_date']
    ordering = ['-reserved_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReservationListSerializer
        return ReservationSerializer

    def get_queryset(self):
        """Filter reservations based on user role"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Regular users can only see their own reservations
            queryset = queryset.filter(user=self.request.user)
        return queryset

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending reservations"""
        reservations = self.get_queryset().filter(status='pending')
        serializer = ReservationListSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation"""
        reservation = self.get_object()
        
        if reservation.status != 'pending':
            return Response(
                {"error": "Only pending reservations can be cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservation.status = 'cancelled'
        reservation.save()
        
        return Response(
            {"message": "Reservation cancelled successfully"},
            status=status.HTTP_200_OK
        )


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.all()
    serializer_class = FineSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'borrowing__book__category']
    search_fields = ['borrowing__book__title', 'borrowing__borrower__first_name']
    ordering_fields = ['amount', 'created_at', 'paid_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return FineListSerializer
        return FineSerializer

    def get_queryset(self):
        """Filter fines based on user role"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Regular users can only see their own fines
            queryset = queryset.filter(borrowing__borrower=self.request.user)
        return queryset

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending fines"""
        fines = self.get_queryset().filter(status='pending')
        serializer = FineListSerializer(fines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Pay a fine"""
        fine = self.get_object()
        serializer = PayFineSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                fine.pay_fine()
                return Response(
                    {"message": "Fine paid successfully"},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def waive(self, request, pk=None):
        """Waive a fine (staff only)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff can waive fines"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        fine = self.get_object()
        serializer = WaiveFineSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                fine.waive_fine(
                    request.user,
                    serializer.validated_data.get('reason', '')
                )
                return Response(
                    {"message": "Fine waived successfully"},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LibrarySettingsViewSet(viewsets.ModelViewSet):
    queryset = LibrarySettings.objects.all()
    serializer_class = LibrarySettingsSerializer
    permission_classes = []
    
    def get_queryset(self):
        """Ensure only one settings instance"""
        return LibrarySettings.objects.all()

    def create(self, request, *args, **kwargs):
        """Prevent creating multiple settings instances"""
        if LibrarySettings.objects.exists():
            return Response(
                {"error": "Library settings already exist"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


class LibraryAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = []

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get library dashboard statistics"""
        total_books = Book.objects.count()
        total_authors = Author.objects.count()
        total_categories = Category.objects.count()
        active_borrowings = Borrowing.objects.filter(status__in=['borrowed', 'overdue']).count()
        overdue_borrowings = Borrowing.objects.filter(status='overdue').count()
        pending_reservations = Reservation.objects.filter(status='pending').count()
        pending_fines = Fine.objects.filter(status='pending').count()
        total_fine_amount = Fine.objects.filter(status='pending').aggregate(
            total=Sum('amount')
        )['total'] or 0

        data = {
            'total_books': total_books,
            'total_authors': total_authors,
            'total_categories': total_categories,
            'active_borrowings': active_borrowings,
            'overdue_borrowings': overdue_borrowings,
            'pending_reservations': pending_reservations,
            'pending_fines': pending_fines,
            'total_fine_amount': total_fine_amount,
        }

        serializer = LibraryDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular_books(self, request):
        """Get most popular books with analytics"""
        books = Book.objects.annotate(
            borrow_count=Count('borrowings'),
            reservation_count=Count('reservations'),
            overdue_count=Count('borrowings', filter=Q(borrowings__status='overdue')),
            fine_amount=Sum('borrowings__fine__amount')
        ).filter(borrow_count__gt=0).order_by('-borrow_count')[:10]

        data = []
        for book in books:
            data.append({
                'book': BookSerializer(book).data,
                'borrow_count': book.borrow_count,
                'reservation_count': book.reservation_count,
                'overdue_count': book.overdue_count,
                'fine_amount': book.fine_amount or 0
            })

        serializer = BookAnalyticsSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Get user library activity"""
        users = request.user
        if request.user.is_staff:
            # Staff can see all users
            from django.contrib.auth import get_user_model
            User = get_user_model()
            users = User.objects.all()

        data = []
        for user in users:
            total_borrowings = Borrowing.objects.filter(borrower=user).count()
            active_borrowings = Borrowing.objects.filter(
                borrower=user,
                status__in=['borrowed', 'overdue']
            ).count()
            overdue_borrowings = Borrowing.objects.filter(
                borrower=user,
                status='overdue'
            ).count()
            total_fines = Fine.objects.filter(
                borrowing__borrower=user
            ).aggregate(total=Sum('amount'))['total'] or 0
            pending_fines = Fine.objects.filter(
                borrowing__borrower=user,
                status='pending'
            ).aggregate(total=Sum('amount'))['total'] or 0

            data.append({
                'user': user.get_full_name() or user.username,
                'total_borrowings': total_borrowings,
                'active_borrowings': active_borrowings,
                'overdue_borrowings': overdue_borrowings,
                'total_fines': total_fines,
                'pending_fines': pending_fines
            })

        serializer = UserLibraryActivitySerializer(data, many=True)
        return Response(serializer.data)
