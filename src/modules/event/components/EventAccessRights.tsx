import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Form,
  Popconfirm,
  Typography,
  Tag,
  Spin,
} from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useRoles } from "../hooks/useRoles";
import { useGrantRole } from "../hooks/useGrantRole";
import { useRemoveRole } from "../hooks/useRemoveRole";
import type { GrantRoleRequest } from "../role.type";

const { Title, Text } = Typography;
const { Option } = Select;

const useStyles = createUseStyles({
  grantRoleCard: {
    marginBottom: 24,
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  formRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-end",
  },
  formItem: {
    flex: 1,
    marginBottom: 0,
  },
  tableCard: {
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  roleTag: {
    fontSize: "13px",
    padding: "4px 12px",
    borderRadius: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    color: "#8c8c8c",
  },
});

interface EventAccessRightsProps {
  eventId: string;
}

export const EventAccessRights = ({ eventId }: EventAccessRightsProps) => {
  const classes = useStyles();
  const [form] = Form.useForm<GrantRoleRequest>();

  const { data: roles, isLoading } = useRoles(eventId);
  const grantRoleMutation = useGrantRole(eventId);
  const removeRoleMutation = useRemoveRole(eventId);

  const handleGrantRole = async (values: GrantRoleRequest) => {
    try {
      await grantRoleMutation.mutateAsync(values);
      form.resetFields();
    } catch (error) {
      console.error(error);
      // Error is handled by the hook
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRoleMutation.mutateAsync(roleId);
    } catch (error) {
      console.error(error);
      // Error is handled by the hook
    }
  };

  const columns = [
    {
      title: "用戶名稱",
      dataIndex: ["userId", "name"], //TODO: require backend to change the object userId to user
      key: "userName",
      width: 150,
      render: (text: string) => text || "-",
    },
    {
      title: "用戶郵箱",
      dataIndex: ["userId", "email"], //TODO: require backend to change the object userId to user
      key: "userEmail",
      width: 200,
      render: (text: string) => text || "-",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role: string) => (
        <Tag color="blue" className={classes.roleTag}>
          {role}
        </Tag>
      ),
    },
    {
      title: "建立時間",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (text: string) =>
        text ? new Date(text).toLocaleString("zh-TW") : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: { id: string }) => (
        <Popconfirm
          title="確定要移除這個角色嗎？"
          onConfirm={() => handleRemoveRole(record.id)}
          okText="確定"
          cancelText="取消"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className={classes.actionButton}
          >
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Card className={classes.grantRoleCard}>
        <Title level={4} style={{ marginBottom: 16 }}>
          授予用戶角色
        </Title>
        <Form
          form={form}
          layout="inline"
          onFinish={handleGrantRole}
          style={{ width: "100%" }}
        >
          <div className={classes.formRow}>
            <Form.Item
              name="userId"
              label="用戶 ID"
              rules={[{ required: true, message: "請輸入用戶 ID" }]}
              className={classes.formItem}
            >
              <Input placeholder="請輸入用戶 ID" />
            </Form.Item>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: "請選擇角色" }]}
              className={classes.formItem}
            >
              <Select placeholder="請選擇角色" style={{ width: "100%" }}>
                <Option value="admin">管理員</Option>
                <Option value="organizer">組織者</Option>
                <Option value="judge">評審</Option>
                <Option value="viewer">查看者</Option>
              </Select>
            </Form.Item>
            <Form.Item className={classes.formItem}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UserAddOutlined />}
                loading={grantRoleMutation.isPending}
              >
                授予角色
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card className={classes.tableCard}>
        <Title level={4} style={{ marginBottom: 16 }}>
          角色列表
        </Title>
        {roles && roles.length > 0 ? (
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 筆記錄`,
            }}
          />
        ) : (
          <div className={classes.emptyState}>
            <Text type="secondary">目前沒有任何角色記錄</Text>
          </div>
        )}
      </Card>
    </Spin>
  );
};
