import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { apiService } from '../services/api';

// Types
export interface Book {
  id: number;
  title: string;
  isbn: string;
  author: Author;
  category: Category;
  publication_year: number;
  publisher: string;
  description: string;
  total_copies: number;
  available_copies: number;
  location: string;
  cover_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  nationality?: string;
  birth_date?: string;
  death_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: number;
  book: Book;
  borrower: any; // User type
  borrowed_date: string;
  due_date: string;
  returned_date?: string;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';
  fine_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  book: Book;
  user: any; // User type
  reservation_date: string;
  expiry_date: string;
  status: 'pending' | 'fulfilled' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Fine {
  id: number;
  borrowing: Borrowing;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  due_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LibrarySettings {
  id: number;
  max_borrow_days: number;
  max_books_per_user: number;
  fine_per_day: number;
  reservation_expiry_days: number;
  auto_send_reminders: boolean;
  reminder_days_before_due: number;
  created_at: string;
  updated_at: string;
}

// API Response Types
interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Store State
interface LibraryState {
  // Books
  books: ApiResponse<Book> | null;
  currentBook: Book | null;
  booksLoading: boolean;
  booksError: string | null;

  // Authors
  authors: ApiResponse<Author> | null;
  currentAuthor: Author | null;
  authorsLoading: boolean;
  authorsError: string | null;

  // Categories
  categories: ApiResponse<Category> | null;
  currentCategory: Category | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Borrowings
  borrowings: ApiResponse<Borrowing> | null;
  currentBorrowing: Borrowing | null;
  borrowingsLoading: boolean;
  borrowingsError: string | null;

  // Reservations
  reservations: ApiResponse<Reservation> | null;
  currentReservation: Reservation | null;
  reservationsLoading: boolean;
  reservationsError: string | null;

  // Fines
  fines: ApiResponse<Fine> | null;
  currentFine: Fine | null;
  finesLoading: boolean;
  finesError: string | null;

  // Settings
  settings: LibrarySettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Actions
  fetchBooks: (params?: any) => Promise<void>;
  fetchBook: (id: number) => Promise<void>;
  createBook: (data: Partial<Book>) => Promise<void>;
  updateBook: (id: number, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  borrowBook: (bookId: number, userId: number) => Promise<void>;
  returnBook: (borrowingId: number) => Promise<void>;

  fetchAuthors: (params?: any) => Promise<void>;
  fetchAuthor: (id: number) => Promise<void>;
  createAuthor: (data: Partial<Author>) => Promise<void>;
  updateAuthor: (id: number, data: Partial<Author>) => Promise<void>;
  deleteAuthor: (id: number) => Promise<void>;

  fetchCategories: (params?: any) => Promise<void>;
  fetchCategory: (id: number) => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  fetchBorrowings: (params?: any) => Promise<void>;
  fetchBorrowing: (id: number) => Promise<void>;
  createBorrowing: (data: Partial<Borrowing>) => Promise<void>;
  updateBorrowing: (id: number, data: Partial<Borrowing>) => Promise<void>;
  deleteBorrowing: (id: number) => Promise<void>;

  fetchReservations: (params?: any) => Promise<void>;
  fetchReservation: (id: number) => Promise<void>;
  createReservation: (data: Partial<Reservation>) => Promise<void>;
  updateReservation: (id: number, data: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;

  fetchFines: (params?: any) => Promise<void>;
  fetchFine: (id: number) => Promise<void>;
  createFine: (data: Partial<Fine>) => Promise<void>;
  updateFine: (id: number, data: Partial<Fine>) => Promise<void>;
  deleteFine: (id: number) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<LibrarySettings>) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  clearCurrent: () => void;
}

// Store Implementation
export const useLibraryStore = create<LibraryState>()(
  devtools(
    (set) => ({
      // Initial State
      books: null,
      currentBook: null,
      booksLoading: false,
      booksError: null,

      authors: null,
      currentAuthor: null,
      authorsLoading: false,
      authorsError: null,

      categories: null,
      currentCategory: null,
      categoriesLoading: false,
      categoriesError: null,

      borrowings: null,
      currentBorrowing: null,
      borrowingsLoading: false,
      borrowingsError: null,

      reservations: null,
      currentReservation: null,
      reservationsLoading: false,
      reservationsError: null,

      fines: null,
      currentFine: null,
      finesLoading: false,
      finesError: null,

      settings: null,
      settingsLoading: false,
      settingsError: null,

      // Book Actions
      fetchBooks: async (params = {}) => {
        set({ booksLoading: true, booksError: null });
        try {
          const data = await apiService.get<any>('/library/books/', { params });
          set({ books: data, booksLoading: false });
        } catch (error: any) {
          set({ 
            booksError: error?.message || 'Failed to fetch books',
            booksLoading: false 
          });
        }
      },

      fetchBook: async (id: number) => {
        set({ booksLoading: true, booksError: null });
        try {
          const data = await apiService.get<any>(`/library/books/${id}/`);
          set({ currentBook: data, booksLoading: false });
        } catch (error: any) {
          set({ 
            booksError: error?.message || 'Failed to fetch book',
            booksLoading: false 
          });
        }
      },

      createBook: async (data: Partial<Book>) => {
        set({ booksLoading: true, booksError: null });
        try {
          const newBook = await apiService.post<any>('/library/books/', data);
          // Auto-create a corresponding e-commerce product if one doesn't already exist
          try {
            const searchKey = newBook?.isbn || newBook?.title;
            const products: any = await apiService.get('/shop/products/', { params: { search: searchKey, page_size: 1 } });
            const exists = (products?.results || []).some((p: any) => (newBook.isbn && p.sku === newBook.isbn) || p.name === newBook.title);
            if (!exists) {
              await apiService.post('/shop/products/', {
                name: newBook.title,
                sku: newBook.isbn || undefined,
                category: 'Book',
                stock: newBook.available_copies ?? 0,
                price: 0,
                is_active: true,
                image_url: newBook.cover_image || undefined,
              });
            }
          } catch (ecommerceError) {
            // Silently handle e-commerce sync errors
            console.warn('Failed to sync book with e-commerce:', ecommerceError);
          }
          set(state => ({
            books: state.books ? {
              ...state.books,
              results: [newBook, ...state.books.results],
              count: state.books.count + 1
            } : null,
            currentBook: newBook,
            booksLoading: false
          }));
        } catch (error: any) {
          set({ 
            booksError: error?.message || 'Failed to create book',
            booksLoading: false 
          });
        }
      },

      updateBook: async (id: number, data: Partial<Book>) => {
        set({ booksLoading: true, booksError: null });
        try {
          const updatedBook = await apiService.put<any>(`/library/books/${id}/`, data);
          // Sync an existing e-commerce product with updated book details
          try {
            const searchKey = updatedBook?.isbn || updatedBook?.title;
            const products: any = await apiService.get('/shop/products/', { params: { search: searchKey, page_size: 1 } });
            const match = (products?.results || []).find((p: any) => (updatedBook.isbn && p.sku === updatedBook.isbn) || p.name === updatedBook.title);
            if (match) {
              await apiService.patch(`/shop/products/${match.id}/`, {
                name: updatedBook.title,
                sku: updatedBook.isbn || undefined,
                stock: updatedBook.available_copies ?? match.stock,
                image_url: updatedBook.cover_image || undefined,
              });
            }
          } catch (ecommerceError) {
            // Silently handle e-commerce sync errors
            console.warn('Failed to sync book with e-commerce:', ecommerceError);
          }
          set(state => ({
            books: state.books ? {
              ...state.books,
              results: state.books.results.map(book => 
                book.id === id ? updatedBook : book
              )
            } : null,
            currentBook: updatedBook,
            booksLoading: false
          }));
        } catch (error: any) {
          set({ 
            booksError: error?.message || 'Failed to update book',
            booksLoading: false 
          });
        }
      },

      deleteBook: async (id: number) => {
        set({ booksLoading: true, booksError: null });
        try {
          await apiService.delete(`/library/books/${id}/`);
          set(state => ({
            books: state.books ? {
              ...state.books,
              results: state.books.results.filter(book => book.id !== id),
              count: state.books.count - 1
            } : null,
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
            booksLoading: false
          }));
        } catch (error: any) {
          set({ 
            booksError: error?.message || 'Failed to delete book',
            booksLoading: false 
          });
        }
      },

      borrowBook: async (bookId: number, userId: number) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.post(`/api/library/books/${bookId}/borrow/`, {
            borrower: userId
          });
          const newBorrowing = response.data;
          // Sync e-commerce product stock based on library book availability
          try {
            const book = newBorrowing?.book;
            if (book) {
              const searchKey = book.isbn || book.title;
              const products: any = await apiService.get('/shop/products/', { params: { search: searchKey, page_size: 1 } });
              const match = (products?.results || []).find((p: any) => (book.isbn && p.sku === book.isbn) || p.name === book.title);
              if (match) {
                await apiService.patch(`/shop/products/${match.id}/`, { stock: book.available_copies ?? 0 });
              }
            }
          } catch (ecommerceError) {
            // Silently handle e-commerce sync errors
            console.warn('Failed to sync borrowing with e-commerce:', ecommerceError);
          }
          set(state => ({
            borrowings: state.borrowings ? {
              ...state.borrowings,
              results: [newBorrowing, ...state.borrowings.results],
              count: state.borrowings.count + 1
            } : null,
            currentBorrowing: newBorrowing,
            borrowingsLoading: false
          }));
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to borrow book',
            borrowingsLoading: false 
          });
        }
      },

      returnBook: async (borrowingId: number) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.post(`/api/library/borrowings/${borrowingId}/return/`);
          const updatedBorrowing = response.data;
          // Sync e-commerce product stock after return
          try {
            const book = updatedBorrowing?.book;
            if (book) {
              const searchKey = book.isbn || book.title;
              const products: any = await apiService.get('/shop/products/', { params: { search: searchKey, page_size: 1 } });
              const match = (products?.results || []).find((p: any) => (book.isbn && p.sku === book.isbn) || p.name === book.title);
              if (match) {
                await apiService.patch(`/shop/products/${match.id}/`, { stock: book.available_copies ?? 0 });
              }
            }
          } catch (ecommerceError) {
            // Silently handle e-commerce sync errors
            console.warn('Failed to sync return with e-commerce:', ecommerceError);
          }
          set(state => ({
            borrowings: state.borrowings ? {
              ...state.borrowings,
              results: state.borrowings.results.map(borrowing => 
                borrowing.id === borrowingId ? updatedBorrowing : borrowing
              )
            } : null,
            currentBorrowing: updatedBorrowing,
            borrowingsLoading: false
          }));
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to return book',
            borrowingsLoading: false 
          });
        }
      },

      // Author Actions
      fetchAuthors: async (params = {}) => {
        set({ authorsLoading: true, authorsError: null });
        try {
          const response = await axios.get('/api/library/authors/', { params });
          set({ authors: response.data, authorsLoading: false });
        } catch (error: any) {
          set({ 
            authorsError: error.response?.data?.message || 'Failed to fetch authors',
            authorsLoading: false 
          });
        }
      },

      fetchAuthor: async (id: number) => {
        set({ authorsLoading: true, authorsError: null });
        try {
          const response = await axios.get(`/api/library/authors/${id}/`);
          set({ currentAuthor: response.data, authorsLoading: false });
        } catch (error: any) {
          set({ 
            authorsError: error.response?.data?.message || 'Failed to fetch author',
            authorsLoading: false 
          });
        }
      },

      createAuthor: async (data: Partial<Author>) => {
        set({ authorsLoading: true, authorsError: null });
        try {
          const response = await axios.post('/api/library/authors/', data);
          const newAuthor = response.data;
          set(state => ({
            authors: state.authors ? {
              ...state.authors,
              results: [newAuthor, ...state.authors.results],
              count: state.authors.count + 1
            } : null,
            currentAuthor: newAuthor,
            authorsLoading: false
          }));
        } catch (error: any) {
          set({ 
            authorsError: error.response?.data?.message || 'Failed to create author',
            authorsLoading: false 
          });
        }
      },

      updateAuthor: async (id: number, data: Partial<Author>) => {
        set({ authorsLoading: true, authorsError: null });
        try {
          const response = await axios.put(`/api/library/authors/${id}/`, data);
          const updatedAuthor = response.data;
          set(state => ({
            authors: state.authors ? {
              ...state.authors,
              results: state.authors.results.map(author => 
                author.id === id ? updatedAuthor : author
              )
            } : null,
            currentAuthor: updatedAuthor,
            authorsLoading: false
          }));
        } catch (error: any) {
          set({ 
            authorsError: error.response?.data?.message || 'Failed to update author',
            authorsLoading: false 
          });
        }
      },

      deleteAuthor: async (id: number) => {
        set({ authorsLoading: true, authorsError: null });
        try {
          await axios.delete(`/api/library/authors/${id}/`);
          set(state => ({
            authors: state.authors ? {
              ...state.authors,
              results: state.authors.results.filter(author => author.id !== id),
              count: state.authors.count - 1
            } : null,
            currentAuthor: state.currentAuthor?.id === id ? null : state.currentAuthor,
            authorsLoading: false
          }));
        } catch (error: any) {
          set({ 
            authorsError: error.response?.data?.message || 'Failed to delete author',
            authorsLoading: false 
          });
        }
      },

      // Category Actions
      fetchCategories: async (params = {}) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await axios.get('/api/library/categories/', { params });
          set({ categories: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch categories',
            categoriesLoading: false 
          });
        }
      },

      fetchCategory: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await axios.get(`/api/library/categories/${id}/`);
          set({ currentCategory: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch category',
            categoriesLoading: false 
          });
        }
      },

      createCategory: async (data: Partial<Category>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await axios.post('/api/library/categories/', data);
          const newCategory = response.data;
          set(state => ({
            categories: state.categories ? {
              ...state.categories,
              results: [newCategory, ...state.categories.results],
              count: state.categories.count + 1
            } : null,
            currentCategory: newCategory,
            categoriesLoading: false
          }));
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to create category',
            categoriesLoading: false 
          });
        }
      },

      updateCategory: async (id: number, data: Partial<Category>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await axios.put(`/api/library/categories/${id}/`, data);
          const updatedCategory = response.data;
          set(state => ({
            categories: state.categories ? {
              ...state.categories,
              results: state.categories.results.map(category => 
                category.id === id ? updatedCategory : category
              )
            } : null,
            currentCategory: updatedCategory,
            categoriesLoading: false
          }));
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to update category',
            categoriesLoading: false 
          });
        }
      },

      deleteCategory: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          await axios.delete(`/api/library/categories/${id}/`);
          set(state => ({
            categories: state.categories ? {
              ...state.categories,
              results: state.categories.results.filter(category => category.id !== id),
              count: state.categories.count - 1
            } : null,
            currentCategory: state.currentCategory?.id === id ? null : state.currentCategory,
            categoriesLoading: false
          }));
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to delete category',
            categoriesLoading: false 
          });
        }
      },

      // Borrowing Actions
      fetchBorrowings: async (params = {}) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.get('/api/library/borrowings/', { params });
          set({ borrowings: response.data, borrowingsLoading: false });
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to fetch borrowings',
            borrowingsLoading: false 
          });
        }
      },

      fetchBorrowing: async (id: number) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.get(`/api/library/borrowings/${id}/`);
          set({ currentBorrowing: response.data, borrowingsLoading: false });
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to fetch borrowing',
            borrowingsLoading: false 
          });
        }
      },

      createBorrowing: async (data: Partial<Borrowing>) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.post('/api/library/borrowings/', data);
          const newBorrowing = response.data;
          set(state => ({
            borrowings: state.borrowings ? {
              ...state.borrowings,
              results: [newBorrowing, ...state.borrowings.results],
              count: state.borrowings.count + 1
            } : null,
            currentBorrowing: newBorrowing,
            borrowingsLoading: false
          }));
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to create borrowing',
            borrowingsLoading: false 
          });
        }
      },

      updateBorrowing: async (id: number, data: Partial<Borrowing>) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          const response = await axios.put(`/api/library/borrowings/${id}/`, data);
          const updatedBorrowing = response.data;
          set(state => ({
            borrowings: state.borrowings ? {
              ...state.borrowings,
              results: state.borrowings.results.map(borrowing => 
                borrowing.id === id ? updatedBorrowing : borrowing
              )
            } : null,
            currentBorrowing: updatedBorrowing,
            borrowingsLoading: false
          }));
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to update borrowing',
            borrowingsLoading: false 
          });
        }
      },

      deleteBorrowing: async (id: number) => {
        set({ borrowingsLoading: true, borrowingsError: null });
        try {
          await axios.delete(`/api/library/borrowings/${id}/`);
          set(state => ({
            borrowings: state.borrowings ? {
              ...state.borrowings,
              results: state.borrowings.results.filter(borrowing => borrowing.id !== id),
              count: state.borrowings.count - 1
            } : null,
            currentBorrowing: state.currentBorrowing?.id === id ? null : state.currentBorrowing,
            borrowingsLoading: false
          }));
        } catch (error: any) {
          set({ 
            borrowingsError: error.response?.data?.message || 'Failed to delete borrowing',
            borrowingsLoading: false 
          });
        }
      },

      // Reservation Actions
      fetchReservations: async (params = {}) => {
        set({ reservationsLoading: true, reservationsError: null });
        try {
          const response = await axios.get('/api/library/reservations/', { params });
          set({ reservations: response.data, reservationsLoading: false });
        } catch (error: any) {
          set({ 
            reservationsError: error.response?.data?.message || 'Failed to fetch reservations',
            reservationsLoading: false 
          });
        }
      },

      fetchReservation: async (id: number) => {
        set({ reservationsLoading: true, reservationsError: null });
        try {
          const response = await axios.get(`/api/library/reservations/${id}/`);
          set({ currentReservation: response.data, reservationsLoading: false });
        } catch (error: any) {
          set({ 
            reservationsError: error.response?.data?.message || 'Failed to fetch reservation',
            reservationsLoading: false 
          });
        }
      },

      createReservation: async (data: Partial<Reservation>) => {
        set({ reservationsLoading: true, reservationsError: null });
        try {
          const response = await axios.post('/api/library/reservations/', data);
          const newReservation = response.data;
          set(state => ({
            reservations: state.reservations ? {
              ...state.reservations,
              results: [newReservation, ...state.reservations.results],
              count: state.reservations.count + 1
            } : null,
            currentReservation: newReservation,
            reservationsLoading: false
          }));
        } catch (error: any) {
          set({ 
            reservationsError: error.response?.data?.message || 'Failed to create reservation',
            reservationsLoading: false 
          });
        }
      },

      updateReservation: async (id: number, data: Partial<Reservation>) => {
        set({ reservationsLoading: true, reservationsError: null });
        try {
          const response = await axios.put(`/api/library/reservations/${id}/`, data);
          const updatedReservation = response.data;
          set(state => ({
            reservations: state.reservations ? {
              ...state.reservations,
              results: state.reservations.results.map(reservation => 
                reservation.id === id ? updatedReservation : reservation
              )
            } : null,
            currentReservation: updatedReservation,
            reservationsLoading: false
          }));
        } catch (error: any) {
          set({ 
            reservationsError: error.response?.data?.message || 'Failed to update reservation',
            reservationsLoading: false 
          });
        }
      },

      deleteReservation: async (id: number) => {
        set({ reservationsLoading: true, reservationsError: null });
        try {
          await axios.delete(`/api/library/reservations/${id}/`);
          set(state => ({
            reservations: state.reservations ? {
              ...state.reservations,
              results: state.reservations.results.filter(reservation => reservation.id !== id),
              count: state.reservations.count - 1
            } : null,
            currentReservation: state.currentReservation?.id === id ? null : state.currentReservation,
            reservationsLoading: false
          }));
        } catch (error: any) {
          set({ 
            reservationsError: error.response?.data?.message || 'Failed to delete reservation',
            reservationsLoading: false 
          });
        }
      },

      // Fine Actions
      fetchFines: async (params = {}) => {
        set({ finesLoading: true, finesError: null });
        try {
          const response = await axios.get('/api/library/fines/', { params });
          set({ fines: response.data, finesLoading: false });
        } catch (error: any) {
          set({ 
            finesError: error.response?.data?.message || 'Failed to fetch fines',
            finesLoading: false 
          });
        }
      },

      fetchFine: async (id: number) => {
        set({ finesLoading: true, finesError: null });
        try {
          const response = await axios.get(`/api/library/fines/${id}/`);
          set({ currentFine: response.data, finesLoading: false });
        } catch (error: any) {
          set({ 
            finesError: error.response?.data?.message || 'Failed to fetch fine',
            finesLoading: false 
          });
        }
      },

      createFine: async (data: Partial<Fine>) => {
        set({ finesLoading: true, finesError: null });
        try {
          const response = await axios.post('/api/library/fines/', data);
          const newFine = response.data;
          set(state => ({
            fines: state.fines ? {
              ...state.fines,
              results: [newFine, ...state.fines.results],
              count: state.fines.count + 1
            } : null,
            currentFine: newFine,
            finesLoading: false
          }));
        } catch (error: any) {
          set({ 
            finesError: error.response?.data?.message || 'Failed to create fine',
            finesLoading: false 
          });
        }
      },

      updateFine: async (id: number, data: Partial<Fine>) => {
        set({ finesLoading: true, finesError: null });
        try {
          const response = await axios.put(`/api/library/fines/${id}/`, data);
          const updatedFine = response.data;
          set(state => ({
            fines: state.fines ? {
              ...state.fines,
              results: state.fines.results.map(fine => 
                fine.id === id ? updatedFine : fine
              )
            } : null,
            currentFine: updatedFine,
            finesLoading: false
          }));
        } catch (error: any) {
          set({ 
            finesError: error.response?.data?.message || 'Failed to update fine',
            finesLoading: false 
          });
        }
      },

      deleteFine: async (id: number) => {
        set({ finesLoading: true, finesError: null });
        try {
          await axios.delete(`/api/library/fines/${id}/`);
          set(state => ({
            fines: state.fines ? {
              ...state.fines,
              results: state.fines.results.filter(fine => fine.id !== id),
              count: state.fines.count - 1
            } : null,
            currentFine: state.currentFine?.id === id ? null : state.currentFine,
            finesLoading: false
          }));
        } catch (error: any) {
          set({ 
            finesError: error.response?.data?.message || 'Failed to delete fine',
            finesLoading: false 
          });
        }
      },

      // Settings Actions
      fetchSettings: async () => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await axios.get('/api/library/settings/');
          set({ settings: response.data, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to fetch settings',
            settingsLoading: false 
          });
        }
      },

      updateSettings: async (data: Partial<LibrarySettings>) => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await axios.put('/api/library/settings/', data);
          set({ settings: response.data, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to update settings',
            settingsLoading: false 
          });
        }
      },

      // Utility Actions
      clearErrors: () => {
        set({
          booksError: null,
          authorsError: null,
          categoriesError: null,
          borrowingsError: null,
          reservationsError: null,
          finesError: null,
          settingsError: null
        });
      },

      clearCurrent: () => {
        set({
          currentBook: null,
          currentAuthor: null,
          currentCategory: null,
          currentBorrowing: null,
          currentReservation: null,
          currentFine: null
        });
      },
    }),
    {
      name: 'library-store',
    }
  )
);
