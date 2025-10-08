import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  StarIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import apiService from '../../services/api';
import PageHeader from '../../components/UI/PageHeader';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  rating?: number;
}

const ShopHome: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await apiService.get('/ecommerce/products/');
      // Filter for featured products or take first 6
      const products = response.data.slice(0, 6).map((product: any) => ({
        ...product,
        rating: Math.floor(Math.random() * 5) + 1 // Mock rating for demo
      }));
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await apiService.post('/ecommerce/cart/', {
        product: product.id,
        quantity: 1
      });
      // Show success message or update cart count
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const categories = [
    { name: 'Books', icon: '📚', color: 'bg-blue-500', count: 150 },
    { name: 'Stationery', icon: '✏️', color: 'bg-green-500', count: 89 },
    { name: 'Electronics', icon: '💻', color: 'bg-purple-500', count: 67 },
    { name: 'Uniforms', icon: '👕', color: 'bg-red-500', count: 45 },
    { name: 'Sports', icon: '⚽', color: 'bg-orange-500', count: 78 },
    { name: 'Art Supplies', icon: '🎨', color: 'bg-pink-500', count: 34 }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="School Shop" 
        subtitle="Browse and purchase school supplies, books, and more"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to EduCore School Shop</h1>
          <p className="text-xl mb-6">Everything you need for academic success in one place</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/shop/products" 
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Products
            </Link>
            <Link 
              to="/shop/cart" 
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/shop/products?category=${category.name}`}
              className="group text-center p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-3 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} items</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/shop/products" className="text-blue-600 hover:text-blue-800 font-medium">
            View All Products →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image_url || 'https://via.placeholder.com/300x200?text=Product+Image'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 0) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">({product.rating || 0})</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-blue-600">৳{product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <Link
                    to={`/shop/products/${product.id}`}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
          <div className="text-gray-600">Products Available</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
          <div className="text-gray-600">Happy Customers</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
          <div className="text-gray-600">Customer Support</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">Fast</div>
          <div className="text-gray-600">Delivery</div>
        </div>
      </div>
    </div>
  );
};

export default ShopHome;
