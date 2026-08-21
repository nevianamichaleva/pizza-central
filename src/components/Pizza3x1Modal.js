'use client';

import {
  PIZZA_3X1_FLAVOR_COUNT,
  calculatePizza3x1BasePrice,
  getPizza3x1FlavorOptions,
} from '@/lib/pizza3x1';
import { Checkbox, Modal } from 'antd';
import { get, ref } from 'firebase/database';
import { useEffect, useMemo, useState } from 'react';
import { rtdb } from '../../lib/firebase';

const EUR_RATE = 1.95583;

function formatEur(bgn) {
  const value = Number.isFinite(bgn) ? bgn : 0;
  return `${(value / EUR_RATE).toFixed(2)}€`;
}

function getProductPackagingTotal(product, packagingData) {
  if (!product?.packagingIds || !packagingData) return 0;
  const ids = Array.isArray(product.packagingIds)
    ? product.packagingIds
    : [product.packagingIds];
  return ids.reduce((sum, packagingId) => {
    const packaging = packagingData[packagingId];
    return sum + (parseFloat(packaging?.price) || 0);
  }, 0);
}

/**
 * Modal: pick exactly 3 different pizzas that participate in Централ 3х1.
 * Displayed price = sum of (each large pizza price / 3) + packaging.
 */
export default function Pizza3x1Modal({
  open,
  product,
  products,
  onCancel,
  onConfirm,
  confirmLoading = false,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [packagingData, setPackagingData] = useState({});

  useEffect(() => {
    if (!open || !product?.packagingIds) {
      setPackagingData({});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const packagingSnapshot = await get(ref(rtdb, 'packaging'));
        if (!cancelled && packagingSnapshot.exists()) {
          setPackagingData(packagingSnapshot.val() || {});
        }
      } catch (error) {
        console.error('Error fetching packaging for 3x1 modal:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, product?.packagingIds]);

  const options = useMemo(() => getPizza3x1FlavorOptions(products), [products]);

  const selectedFlavors = useMemo(
    () =>
      selectedIds
        .map((id) => options.find((p) => p.id === id))
        .filter(Boolean),
    [selectedIds, options]
  );

  const basePrice = calculatePizza3x1BasePrice(selectedFlavors);
  const packagingTotal = getProductPackagingTotal(product, packagingData);
  const displayPrice = Math.round((basePrice + packagingTotal) * 100) / 100;
  const canConfirm = selectedFlavors.length === PIZZA_3X1_FLAVOR_COUNT;

  const handleChange = (checkedValues) => {
    if (checkedValues.length <= PIZZA_3X1_FLAVOR_COUNT) {
      setSelectedIds(checkedValues);
    }
  };

  const handleOk = () => {
    if (!canConfirm) return;
    onConfirm?.(selectedFlavors);
    setSelectedIds([]);
  };

  const handleCancel = () => {
    setSelectedIds([]);
    onCancel?.();
  };

  return (
    <Modal
      title="Изберете 3 вкуса"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Добави"
      cancelText="Отказ"
      okButtonProps={{ disabled: !canConfirm, loading: confirmLoading }}
      destroyOnClose
      width={520}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 4 }}>
          <strong>{product?.name}</strong>
        </p>
        <p style={{ color: '#4a4a4a', fontSize: 14, marginBottom: 0 }}>
          Изберете точно {PIZZA_3X1_FLAVOR_COUNT} различни вкуса. Цената ще се изчисли въз основа на цената на всяка избрана пица.        </p>
      </div>

      {options.length === 0 ? (
        <p style={{ color: '#d32f2f' }}>
          Няма продукти, маркирани за участие в Пица Централ 3х1. Маркирайте ги в
          админ панела.
        </p>
      ) : (
        <Checkbox.Group
          value={selectedIds}
          onChange={handleChange}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
            {options.map((flavor) => {
              const checked = selectedIds.includes(flavor.id);
              const disabled =
                !checked && selectedIds.length >= PIZZA_3X1_FLAVOR_COUNT;
              return (
                <Checkbox
                  key={flavor.id}
                  value={flavor.id}
                  disabled={disabled}
                  style={{ fontSize: 15, alignItems: 'flex-start' }}
                >
                  {flavor.name}
                </Checkbox>
              );
            })}
          </div>
        </Checkbox.Group>
      )}

      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: '#666' }}>
          Избрани: {selectedIds.length}/{PIZZA_3X1_FLAVOR_COUNT}
        </span>
        <strong style={{ fontSize: 16 }}>
          {canConfirm ? `Цена: ${formatEur(displayPrice)}` : 'Изберете 3 вкуса'}
        </strong>
      </div>
    </Modal>
  );
}
