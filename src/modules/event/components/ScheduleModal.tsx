import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Checkbox,
  Select,
  InputNumber,
  Modal,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";

dayjs.locale("zh-tw");

type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";

export interface CustomEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  recurrenceGroupId?: string;
}

const recurrenceOptions = [
  { value: "none", label: "不重複" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每週" },
  { value: "biweekly", label: "每兩週" },
  { value: "monthly", label: "每月" },
];

interface ScheduleModalProps {
  open: boolean;
  editingEvent: CustomEvent | null;
  onSave: (values: {
    title: string;
    description?: string;
    startDate: dayjs.Dayjs;
    startTime?: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    endTime?: dayjs.Dayjs;
    allDay: boolean;
    recurrence?: RecurrenceType;
    occurrences?: number;
  }) => void;
  onCancel: () => void;
  initialValues?: {
    startDate?: dayjs.Dayjs;
    startTime?: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
    endTime?: dayjs.Dayjs;
    allDay?: boolean;
  };
}

export const ScheduleModal = ({
  open,
  editingEvent,
  onSave,
  onCancel,
  initialValues,
}: ScheduleModalProps) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingEvent ? "編輯行程" : "新增行程"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="儲存"
      cancelText="取消"
      width={600}
      afterOpenChange={(visible) => {
        if (visible) {
          if (editingEvent) {
            form.setFieldsValue({
              title: editingEvent.title,
              description: editingEvent.description,
              startDate: dayjs(editingEvent.start),
              startTime: dayjs(editingEvent.start),
              endDate: dayjs(editingEvent.end),
              endTime: dayjs(editingEvent.end),
              allDay: editingEvent.allDay || false,
            });
          } else if (initialValues) {
            form.setFieldsValue(initialValues);
          } else {
            form.resetFields();
          }
        } else {
          form.resetFields();
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="標題"
          rules={[{ required: true, message: "請輸入標題" }]}
        >
          <Input placeholder="例如：比賽開賽" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="輸入行程描述（選填）" />
        </Form.Item>
        <Form.Item name="allDay" valuePropName="checked" initialValue={false}>
          <Checkbox>全天事件</Checkbox>
        </Form.Item>
        {!editingEvent && (
          <>
            <Form.Item name="recurrence" label="重複" initialValue="none">
              <Select options={recurrenceOptions} />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.recurrence !== currentValues.recurrence
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("recurrence") !== "none" && (
                  <Form.Item
                    name="occurrences"
                    label="重複次數"
                    initialValue={4}
                    rules={[{ required: true, message: "請輸入重複次數" }]}
                  >
                    <InputNumber
                      min={2}
                      max={52}
                      style={{ width: "100%" }}
                      placeholder="例如：4 次"
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
          </>
        )}
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.allDay !== currentValues.allDay
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("allDay") ? (
              <>
                <Form.Item
                  name="startDate"
                  label="開始日期"
                  rules={[{ required: true, message: "請選擇開始日期" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item
                  name="endDate"
                  label="結束日期"
                  rules={[{ required: true, message: "請選擇結束日期" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="startDate"
                  label="開始日期"
                  rules={[{ required: true, message: "請選擇開始日期" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item
                  name="startTime"
                  label="開始時間"
                  rules={[{ required: true, message: "請選擇開始時間" }]}
                >
                  <TimePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>
                <Form.Item
                  name="endDate"
                  label="結束日期"
                  rules={[{ required: true, message: "請選擇結束日期" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item
                  name="endTime"
                  label="結束時間"
                  rules={[{ required: true, message: "請選擇結束時間" }]}
                >
                  <TimePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>
              </>
            )
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};
