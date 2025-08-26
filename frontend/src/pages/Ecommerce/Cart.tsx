import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';

const Cart: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await apiService.get('/shop/cart/');
      setItems(data.items || []);
    } catch (e: any) { setError('Failed to load cart'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id: string, qty: number) => {
    await apiService.patch(`/shop/cart/items/${id}/`, { quantity: qty });
    fetchCart();
  };

  const remove = async (id: string) => {
    await apiService.delete(`/shop/cart/items/${id}/`);
    fetchCart();
  };

  const checkout = async () => {
    await apiService.post('/shop/cart/checkout/');
    fetchCart();
  };

  const total = items.reduce((sum, it: any) => sum + (it.price * it.quantity), 0);

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Shopping Cart" subtitle="View and manage items in your cart" />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        {!items.length && !loading ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between border-b py-3">
                <div>
                  <p className="font-medium text-gray-900">{row.name}</p>
                  <p className="text-sm text-gray-600">{row.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => updateQty(row.id, Math.max(1, row.quantity - 1))}>-</Button>
                  <span className="w-8 text-center">{row.quantity}</span>
                  <Button variant="outline" onClick={() => updateQty(row.id, row.quantity + 1)}>+</Button>
                </div>
                <div className="w-24 text-right">{row.price * row.quantity}</div>
                <Button variant="outline" onClick={() => remove(row.id)}>Remove</Button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <div className="font-semibold">Total: {total}</div>
              <Button onClick={checkout}>Checkout</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Cart;


