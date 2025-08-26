from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, OrderViewSet, OrderItemViewSet,
    CartViewSet, CartItemViewSet, PaymentViewSet, ShippingViewSet,
    DiscountViewSet, ReviewViewSet, WishlistViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'shipping', ShippingViewSet)
router.register(r'discounts', DiscountViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

app_name = 'ecommerce'

urlpatterns = [
    path('', include(router.urls)),
]
