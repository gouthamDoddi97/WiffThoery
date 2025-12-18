import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose, cart, onRemoveItem }) => {
    const total = cart.reduce((sum, item) => {
        // Handle both string and number prices
        const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace('$', '').replace(/,/g, ''))
            : parseFloat(item.price);
        return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="cart-drawer-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        <motion.div
                            className="cart-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="cart-drawer__header">
                                <h2 className="cart-drawer__title">
                                    Your Cart
                                    <span className="cart-drawer__count">({cart.length} items)</span>
                                </h2>
                                <button className="cart-drawer__close" onClick={onClose}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="cart-drawer__content">
                                {cart.length === 0 ? (
                                    <div className="cart-drawer__empty">
                                        <ShoppingBag size={48} style={{ opacity: 0.3 }} />
                                        <p>Your cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${index}`}
                                            className="cart-item"
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <img src={item.image} alt={item.name} className="cart-item__image" />
                                            <div className="cart-item__details">
                                                <h3 className="cart-item__name">{item.name}</h3>
                                                <p className="cart-item__price">{item.price}</p>
                                            </div>
                                            <button
                                                className="cart-item__remove"
                                                onClick={() => onRemoveItem(index)}
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="cart-drawer__footer">
                                    <div className="cart-drawer__total">
                                        <span className="cart-drawer__total-label">Total</span>
                                        <span className="cart-drawer__total-amount">${total.toFixed(2)}</span>
                                    </div>
                                    <button className="button button--primary cart-drawer__checkout">
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
