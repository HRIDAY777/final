from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet, OrderItemViewSet,
    CartViewSet, CartItemViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet)

app_name = 'ecommerce'

urlpatterns = [
    path('', include(router.urls)),
    # Shop-specific URLs for frontend compatibility
    path('shop/', include([
        path('products/', ProductViewSet.as_view({'get': 'list'})),
        path('cart/', CartViewSet.as_view({
            'get': 'retrieve', 'post': 'create'
        })),
        path('cart/checkout/', CartViewSet.as_view({
            'post': 'checkout'
        })),
        path('cart/add/', CartItemViewSet.as_view({'post': 'create'})),
        path('orders/', OrderViewSet.as_view({
            'get': 'list', 'post': 'create'
        })),
    ])),
]
