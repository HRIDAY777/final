import { PaginatedResponse } from '../types'

const now = new Date()

const mockPaginated = <T>(items: T[]): PaginatedResponse<T> => ({
	count: items.length,
	next: null,
	previous: null,
	results: items,
})

export const isDemoMode = (import.meta as any)?.env?.VITE_DEMO_MODE === 'true'
	|| (typeof (import.meta as any)?.env?.VITE_DEMO_MODE === 'undefined')

export const mockGet = (url: string): any => {
	// Normalize: strip query string
	const path = url.split('?')[0]

	// Academics → Classes
	if (path.startsWith('/academics/classes/')) {
		return mockPaginated([
			{ id: 'c-10a', name: 'Class 10', section: 'A', academic_year: '2025', capacity: 40, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), current_student_count: 34, is_full: false },
			{ id: 'c-10b', name: 'Class 10', section: 'B', academic_year: '2025', capacity: 40, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), current_student_count: 31, is_full: false },
			{ id: 'c-9a', name: 'Class 9', section: 'A', academic_year: '2025', capacity: 40, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), current_student_count: 29, is_full: false },
		])
	}

	// Attendance → Sessions
	if (path.startsWith('/attendance/sessions/')) {
		return mockPaginated([
			{ id: 's1', course: { id: 'crs-1' }, date: now.toISOString().slice(0,10), start_time: '09:00', end_time: '10:00', session_type: 'regular', is_active: true, created_by: { id: 't1' }, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 's2', course: { id: 'crs-2' }, date: now.toISOString().slice(0,10), start_time: '10:00', end_time: '11:00', session_type: 'regular', is_active: true, created_by: { id: 't2' }, created_at: now.toISOString(), updated_at: now.toISOString() },
		])
	}

	// Exams → Exams
	if (path.startsWith('/exams/exams/')) {
		return mockPaginated([
			{ id: 'e1', title: 'Mid Term Math', description: 'Algebra & Geometry', exam_type: 'written', subject: { id: 'sub-math' }, course: { id: 'crs-1' }, total_marks: 100, duration_minutes: 90, passing_marks: 35, is_active: true, allow_retake: false, max_attempts: 1, instructions: 'Use blue/black pen', created_by: { id: 't1' }, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 'e2', title: 'Science Quiz', description: 'Physics Basics', exam_type: 'quiz', subject: { id: 'sub-sci' }, course: { id: 'crs-2' }, total_marks: 50, duration_minutes: 30, passing_marks: 18, is_active: true, allow_retake: true, max_attempts: 2, instructions: '', created_by: { id: 't2' }, created_at: now.toISOString(), updated_at: now.toISOString() },
		])
	}

	// Fallback: empty list style
	if (path.startsWith('/academics/') || path.startsWith('/attendance/') || path.startsWith('/exams/')) {
		return mockPaginated([])
	}

	// Dashboard helper endpoints
	if (path.startsWith('/dashboard/')) {
		return {}
	}

	// Billing demo mock endpoints
	if (path.startsWith('/billing/plans/')) {
		return mockPaginated([
			{ id: 1, name: 'Basic', description: 'For small schools', price: 29, currency: 'USD', billing_cycle: 'monthly', features: ['100 students','5 teachers'], max_students: 100, max_teachers: 5, max_storage_gb: 10, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 2, name: 'Pro', description: 'Most popular', price: 79, currency: 'USD', billing_cycle: 'monthly', features: ['1000 students','50 teachers'], max_students: 1000, max_teachers: 50, max_storage_gb: 100, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 3, name: 'Enterprise', description: 'Custom needs', price: 199, currency: 'USD', billing_cycle: 'monthly', features: ['Unlimited'], max_students: 100000, max_teachers: 5000, max_storage_gb: 1000, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
		])
	}

	if (path.startsWith('/billing/invoices/')) {
		return mockPaginated([])
	}
	if (path.startsWith('/billing/payments/')) {
		return mockPaginated([])
	}

	// Library → Books (demo data)
	if (path.startsWith('/library/books/')) {
		return mockPaginated([
			{ id: 1, title: 'Mathematics Essentials', isbn: '978000000001', author: { id: 1, name: 'A. Gupta' }, category: { id: 1, name: 'Mathematics' }, publication_year: 2022, publisher: 'Scholastic', description: 'Core algebra and geometry concepts', total_copies: 30, available_copies: 22, location: 'Aisle 3 - M', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 2, title: 'Physics Fundamentals', isbn: '978000000002', author: { id: 2, name: 'R. Iqbal' }, category: { id: 2, name: 'Science' }, publication_year: 2021, publisher: 'Pearson', description: 'Mechanics, waves, and optics', total_copies: 20, available_copies: 12, location: 'Aisle 2 - P', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
			{ id: 3, title: 'World History', isbn: '978000000003', author: { id: 3, name: 'S. Ahmed' }, category: { id: 3, name: 'History' }, publication_year: 2020, publisher: 'Oxford', description: 'A concise history of the world', total_copies: 25, available_copies: 8, location: 'Aisle 5 - H', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString() },
		])
	}

	// E-commerce → Products demo inventory (books + stationery)
	if (!Array.isArray((globalThis as any).__mockProducts)) {
		(globalThis as any).__mockProducts = [
			{ id: 'p-001', name: 'Mathematics Essentials', sku: '978000000001', category: 'Book', price: 450, stock: 22, is_active: true, image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop' },
			{ id: 'p-002', name: 'Physics Fundamentals', sku: '978000000002', category: 'Book', price: 420, stock: 12, is_active: true, image_url: 'https://images.unsplash.com/photo-1526312426976-593c2d0e4907?q=80&w=800&auto=format&fit=crop' },
			{ id: 'p-003', name: 'World History', sku: '978000000003', category: 'Book', price: 399, stock: 8, is_active: true, image_url: 'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?q=80&w=800&auto=format&fit=crop' },
			{ id: 'p-101', name: 'Blue Ball Pen (Pack of 10)', sku: 'PEN-BLUE-10', category: 'Stationery', price: 120, stock: 150, is_active: true, image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop' },
			{ id: 'p-102', name: 'A4 Notebook 200 Pages', sku: 'NOTE-A4-200', category: 'Stationery', price: 80, stock: 90, is_active: true, image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop' },
			{ id: 'p-103', name: 'Geometry Box', sku: 'GEOM-BOX', category: 'Stationery', price: 180, stock: 40, is_active: true, image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop' },
		]
	}
	const mockProducts: any[] = (globalThis as any).__mockProducts

	if (path === '/shop/products/') {
		return mockPaginated(mockProducts)
	}
	if (path.startsWith('/shop/products/') && path !== '/shop/products/') {
		const id = path.split('/').filter(Boolean).pop()!
		const found = mockProducts.find(p => String(p.id) === id)
		return found || {}
	}

	// Demo Cart store
	if (!(globalThis as any).__mockCart) {
		(globalThis as any).__mockCart = { seq: 1, items: [] as any[] }
	}
	const mockCart = (globalThis as any).__mockCart as { seq: number, items: any[] }

	if (path === '/shop/cart/') {
		return { items: mockCart.items }
	}

	// Generic Library fallbacks
	if (path.startsWith('/library/')) {
		return mockPaginated([])
	}

	return {}
}

export const mockPost = (url: string, data?: any): any => {
    const path = url.split('?')[0]
    if (path === '/shop/cart/checkout/') {
        const cart = (globalThis as any).__mockCart as { items: any[] }
        const total = cart.items.reduce((s: number, it: any) => s + it.price * it.quantity, 0)
        const order = { id: Math.random().toString(36).slice(2), order_number: Math.random().toString(36).slice(2,10).toUpperCase(), status: 'paid', total_amount: total, items: cart.items }
        cart.items = []
        return order
    }
    if (path === '/shop/cart/add/') {
        const cart = (globalThis as any).__mockCart as { seq: number, items: any[] }
        const prod = data || {}
        const exist = cart.items.find((x: any) => x.sku === prod.sku)
        if (exist) exist.quantity += (prod.quantity || 1)
        else cart.items.push({ id: String(cart.seq++), name: prod.name, sku: prod.sku, price: prod.price || 0, quantity: prod.quantity || 1 })
        return { items: cart.items }
    }
    return { success: true }
}
export const mockPut = (_url: string, _data?: any): any => ({ success: true })
export const mockPatch = (url: string, data?: any): any => {
    const path = url.split('?')[0]
    if (path.startsWith('/shop/cart/items/')) {
        const id = path.split('/').filter(Boolean).pop()!
        const cart = (globalThis as any).__mockCart as { items: any[] }
        const item = cart.items.find((x: any) => String(x.id) === id)
        if (item) item.quantity = Math.max(1, parseInt(String((data as any)?.quantity || item.quantity)))
        return { items: cart.items }
    }
    return { success: true }
}
export const mockDelete = (url: string): any => {
    const path = url.split('?')[0]
    if (path.startsWith('/shop/cart/items/')) {
        const id = path.split('/').filter(Boolean).pop()!
        const cart = (globalThis as any).__mockCart as { items: any[] }
        (cart.items as any[]).splice(cart.items.findIndex((x: any) => String(x.id) === id), 1)
        return { items: cart.items }
    }
    return { success: true }
}


