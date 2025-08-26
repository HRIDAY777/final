import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const CategoryCard: React.FC<{ title: string; image: string; to: string }> = ({ title, image, to }) => (
	<Link to={to} className="group block rounded-xl overflow-hidden border bg-white hover:shadow-lg transition">
		<div className="relative h-28 sm:h-36">
			<img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
			<div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
			<div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white font-semibold">{title}</div>
		</div>
	</Link>
);

const ProductCard: React.FC<{ p: any }> = ({ p }) => (
	<div className="rounded-xl border bg-white p-4 hover:shadow-md transition">
		<div className="h-28 sm:h-36 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center mb-3">
			{p.image_url ? (
				<img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
			) : (
				<span className="text-xs text-gray-400">No Image</span>
			)}
		</div>
		<div className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</div>
		<div className="mt-1 text-xs text-gray-500">{p.category || '-'}</div>
		<div className="mt-2 text-sm font-semibold">Tk. {p.price}</div>
	</div>
);

const ShopHome: React.FC = () => {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const run = async () => {
			setLoading(true);
			try {
				const data: any = await apiService.get('/shop/products/');
				setItems(data.results || []);
			} finally {
				setLoading(false);
			}
		};
		run();
	}, []);

	const books = useMemo(() => items.filter((x: any) => (x.category || '').toLowerCase() === 'book').slice(0, 8), [items]);
	const stationery = useMemo(() => items.filter((x: any) => (x.category || '').toLowerCase() === 'stationery').slice(0, 8), [items]);

	return (
		<div className="space-y-8">
			{/* Hero */}
			<div className="relative overflow-hidden rounded-2xl border">
				<img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=2000&auto=format&fit=crop" alt="Books hero" className="absolute inset-0 w-full h-full object-cover" />
				<div className="relative bg-gradient-to-r from-blue-900/70 via-blue-700/40 to-transparent">
					<div className="px-4 sm:px-6 md:px-8 py-16 md:py-20 text-white">
						<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Your home for learning essentials</h1>
						<p className="mt-3 max-w-2xl text-white/90">Browse books, stationeries and more. Best prices, fast delivery, and easy returns.</p>
						<div className="mt-6 flex gap-3">
							<Link to="/shop/products?category=Book" className="px-4 py-2 rounded-md bg-white text-gray-900 font-medium hover:bg-gray-100">Shop Books</Link>
							<Link to="/shop/products?category=Stationery" className="px-4 py-2 rounded-md border border-white/70 text-white hover:bg-white/10">Shop Stationeries</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Categories */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-xl font-bold text-gray-900">Browse Categories</h2>
					<Link to="/shop/products" className="text-sm text-blue-600">See all</Link>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					<CategoryCard title="Books" image="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop" to="/shop/products?category=Book" />
					<CategoryCard title="Stationeries" image="https://images.unsplash.com/photo-1519681392559-0f7f1f2f12c4?q=80&w=1200&auto=format&fit=crop" to="/shop/products?category=Stationery" />
					<CategoryCard title="Accessories" image="https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop" to="/shop/products?category=Accessories" />
					<CategoryCard title="Print & Bind" image="https://images.unsplash.com/photo-1461344577544-4e5dc9487184?q=80&w=1200&auto=format&fit=crop" to="/shop/products?category=Print%20%26%20Bind" />
				</div>
			</div>

			{/* Popular Books */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-xl font-bold text-gray-900">Popular Books</h2>
					<Link to="/shop/products?category=Book" className="text-sm text-blue-600">See all</Link>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{(loading ? Array.from({ length: 8 }) : books).map((p: any, i: number) => (
						<div key={p?.id || i} className="min-h-[180px]">
							{loading ? (
								<div className="h-full rounded-xl border bg-white p-4 animate-pulse" />
							) : (
								<ProductCard p={p} />
							)}
						</div>
					))}
				</div>
			</div>

			{/* Stationeries */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-xl font-bold text-gray-900">Stationeries</h2>
					<Link to="/shop/products?category=Stationery" className="text-sm text-blue-600">See all</Link>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{(loading ? Array.from({ length: 8 }) : stationery).map((p: any, i: number) => (
						<div key={p?.id || i} className="min-h-[180px]">
							{loading ? (
								<div className="h-full rounded-xl border bg-white p-4 animate-pulse" />
							) : (
								<ProductCard p={p} />
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ShopHome;


