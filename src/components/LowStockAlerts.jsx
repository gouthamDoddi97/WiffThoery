import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { getLowStockProducts } from '../lib/supabase';
import formatINR from '../lib/formatCurrency';

const LowStockAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const data = await getLowStockProducts();
        setLowStockItems(data);
      } catch (err) {
        console.error('Error fetching low stock items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchLowStock, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="low-stock-alerts" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading stock alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="low-stock-alerts" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <p>Error loading stock alerts: {error}</p>
      </div>
    );
  }

  if (lowStockItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="low-stock-alerts"
        style={{
          padding: '2rem',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          textAlign: 'center',
        }}
      >
        <Package style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} size={48} />
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>All Products Well Stocked</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>No low stock alerts at this time.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="low-stock-alerts"
      style={{
        padding: '2rem',
        background: 'rgba(255, 152, 0, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 152, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <AlertTriangle style={{ color: '#ff9800' }} size={32} />
        <div>
          <h3 style={{ marginBottom: '0.25rem', color: 'var(--color-text)' }}>
            Low Stock Alert
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} running low on inventory
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {lowStockItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'var(--color-bg)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div>
              <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-text)' }}>
                {item.name}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {formatINR(item.price)}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: item.stock_quantity <= 10 ? '#f44336' : '#ff9800'
                }}>
                  <TrendingDown size={16} />
                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {item.stock_quantity}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Threshold: {item.low_stock_threshold}
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="button button--small button--primary"
                onClick={() => window.open(
                  `https://znjwdpvawljoadftdxaw.supabase.co/project/_/editor/${item.id}`,
                  '_blank'
                )}
                style={{ whiteSpace: 'nowrap' }}
              >
                Restock
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)'
      }}>
        💡 <strong>Tip:</strong> Update stock quantities in the Supabase Table Editor to clear alerts.
        Auto-refreshes every 5 minutes.
      </div>
    </motion.div>
  );
};

export default LowStockAlerts;
