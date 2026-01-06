import { CloseOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Input, Select, Space, Switch, Table, Tag } from "antd";
import { useState } from "react";

const { Option } = Select;

const EditableTable = ({ data, categories, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState(null); 
  const [editingRecord, setEditingRecord] = useState({}); 

  const editRow = (record) => {
    setEditingId(record.id);
    setEditingRecord({ 
      ...record,
      slug: record.slug || '' // Ensure slug is always initialized
    }); 
  };

  const saveRow = () => {
    onSave(editingRecord); 
    setEditingId(null); 
  };

  const cancelEdit = () => {
    setEditingId(null); 
  };

  const handleChange = (key, value) => {
    if (key === 'order') {
      // Ensure order is always a number
      const numValue = value === '' || value === null || value === undefined 
        ? 0 
        : (typeof value === 'string' ? parseInt(value) || 0 : value);
      setEditingRecord((prev) => ({ ...prev, [key]: numValue }));
    } else if (key === 'slug') {
      // Ensure slug is always a string (even if empty)
      setEditingRecord((prev) => ({ ...prev, [key]: value || '' }));
    } else {
      setEditingRecord((prev) => ({ ...prev, [key]: value }));
    }
  };

  const columns = [
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return (
          <Space size="middle">
            {isEditing ? (
              <>
                <a onClick={saveRow}>
                  <SaveOutlined />
                </a>
                <a onClick={cancelEdit}>
                  <CloseOutlined />
                </a>
              </>
            ) : (
              <>
                <a onClick={() => editRow(record)}>
                  <EditOutlined />
                </a>
                <a>
                  <DeleteOutlined onClick={() => onDelete(record.id)}/>
                </a>
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: "Меню",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Input
            value={editingRecord.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        ) : (
          record.name
        );
      },
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Input
            value={editingRecord.slug || ''}
            onChange={(e) => handleChange("slug", e.target.value)}
          />
        ) : (
          record.slug || ''
        );
      },
    },
    {
      title: "В меню",
      dataIndex: "parent",
      key: "parent",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Select
            value={editingRecord.parent}
            onChange={(value) => handleChange("parent", value)}
            style={{ width: "100%" }}
          >
            {categories.map((category) => (
              <Option key={category.name+category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        ) : (
          categories.find((cat) => cat.id === record.parent)?.name || ""
        );
      },
    },
    {
      title: "Доставка",
      dataIndex: "forDelivery",
      key: "forDelivery",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Switch
            checked={editingRecord.forDelivery !== false}
            onChange={(checked) => handleChange("forDelivery", checked)}
          />
        ) : (
          record.forDelivery !== false ? "Да" : "Не"
        );
      },
    },
    {
      title: "Ресторант",
      dataIndex: "forRestaurant",
      key: "forRestaurant",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Switch
            checked={editingRecord.forRestaurant !== false}
            onChange={(checked) => handleChange("forRestaurant", checked)}
          />
        ) : (
          record.forRestaurant !== false ? "Да" : "Не"
        );
      },
    },
    {
      title: "Номер по ред",
      dataIndex: "order",
      key: "order",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        return isEditing ? (
          <Input
            type="number"
            value={editingRecord.order !== undefined && editingRecord.order !== null ? editingRecord.order : 0}
            onChange={(e) => handleChange("order", e.target.value)}
          />
        ) : (
          record.order !== undefined ? record.order : 0
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const isEditing = editingId === record.id;
        const status = record.status || 'active';
        const statusMap = {
          'active': { text: 'Активна', color: 'green' },
          'inactive': { text: 'Неактивна', color: 'red' },
          'archived': { text: 'Архивирана', color: 'orange' }
        };
        return isEditing ? (
          <Select
            value={editingRecord.status || 'active'}
            onChange={(value) => handleChange("status", value)}
            style={{ width: "100%" }}
          >
            <Option value="active">Активна</Option>
            <Option value="inactive">Неактивна</Option>
            <Option value="archived">Архивирана</Option>
          </Select>
        ) : (
          <Tag color={statusMap[status]?.color || 'default'}>
            {statusMap[status]?.text || status}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default EditableTable;
