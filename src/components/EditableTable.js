import { CloseOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Input, Select, Space, Table } from "antd";
import { useState } from "react";

const { Option } = Select;

const EditableTable = ({ data, categories, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState(null); 
  const [editingRecord, setEditingRecord] = useState({}); 

  const editRow = (record) => {
    setEditingId(record.id);
    setEditingRecord({ ...record }); 
  };

  const saveRow = () => {
    onSave(editingRecord); 
    setEditingId(null); 
  };

  const cancelEdit = () => {
    setEditingId(null); 
  };

  const handleChange = (key, value) => {
    setEditingRecord((prev) => ({ ...prev, [key]: value }));
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
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
};

export default EditableTable;
