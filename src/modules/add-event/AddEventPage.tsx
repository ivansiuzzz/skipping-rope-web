import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Dayjs } from "dayjs";
import {
  Input,
  DatePicker,
  Select,
  InputNumber,
  Button,
  Form,
  Space,
  notification,
} from "antd";
import { createUseStyles } from "react-jss";
import { useCreateEvent } from "./hooks/useCreateEvent";

// EventStatus enum to match backend
export type EventStatus =
  | "DRAFT"
  | "REGISTRATION_OPEN"
  | "ONGOING"
  | "COMPLETED";

const eventSchema = z.object({
  title: z.string().min(1, "請輸入賽事名稱"),
  description: z.string().min(1, "請輸入賽事描述"),
  eventStartDate: z
    .custom<Dayjs>()
    .refine((val) => val !== null && val !== undefined, "請選擇賽事開始日期"),
  eventEndDate: z
    .custom<Dayjs>()
    .refine((val) => val !== null && val !== undefined, "請選擇賽事結束日期"),
  registrationDeadline: z
    .custom<Dayjs>()
    .refine((val) => val !== null && val !== undefined, "請選擇報名截止日期"),
  status: z.enum(["DRAFT", "REGISTRATION_OPEN", "ONGOING", "COMPLETED"], {
    required_error: "請選擇賽事狀態",
  }),
  maxSchools: z.number().min(1, "最大參賽學校數至少為1"),
  maxParticipants: z.number().min(1, "最大參賽人數至少為1"),
  location: z.string().min(1, "請輸入比賽地點"),
  contactPerson: z.string().min(1, "請輸入聯絡人"),
  contactPhone: z.string().min(1, "請輸入聯絡電話"),
  contactEmail: z.string().email("請輸入有效的電子郵件"),
  rules: z.string().optional(),
  prizes: z.string().optional(),
});

export type EventForm = z.infer<typeof eventSchema>;

type StyleClasses = {
  form: string;
  buttonContainer: string;
  spaceContainer: string;
  flexItem: string;
  marginTop: string;
  fullWidth: string;
};

const useStyles = createUseStyles<string, object, StyleClasses>({
  form: {
    marginTop: 24,
  },
  buttonContainer: {
    padding: "24px 0",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  spaceContainer: {
    width: "100%",
  },
  flexItem: {
    flex: 1,
    marginBottom: 0,
  },
  marginTop: {
    marginTop: 24,
  },
  fullWidth: {
    width: "100%",
  },
});

const STATUS_OPTIONS: Array<{ value: EventStatus; label: string }> = [
  { value: "DRAFT", label: "籌備中" },
  { value: "REGISTRATION_OPEN", label: "報名中" },
  { value: "ONGOING", label: "進行中" },
  { value: "COMPLETED", label: "已結束" },
];

const AddEventPage = () => {
  const classes = useStyles();
  const createEventMutation = useCreateEvent();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventStartDate: undefined,
      eventEndDate: undefined,
      registrationDeadline: undefined,
      status: "DRAFT",
      maxSchools: 20,
      maxParticipants: 400,
      location: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      rules: "",
      prizes: "",
    },
  });

  const onSubmit = async (data: EventForm) => {
    try {
      await createEventMutation.mutateAsync(data);
      notification.success({
        message: "創建成功",
        description: "賽事已成功創建",
      });
      reset();
    } catch (error) {
      // Error handling is done by the API interceptor
      console.error(error);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <>
      <Form layout="vertical" className={classes.form}>
        {/* 賽事名稱 */}
        <Form.Item
          label="賽事名稱"
          validateStatus={errors.title ? "error" : ""}
          help={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="請輸入賽事名稱" size="large" />
            )}
          />
        </Form.Item>

        {/* 賽事描述 */}
        <Form.Item
          label="賽事描述"
          validateStatus={errors.description ? "error" : ""}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="請輸入賽事描述"
                rows={4}
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* 賽事開始日期 & 結束日期 */}
        <Space className={classes.spaceContainer} size="large">
          <Form.Item
            label="賽事開始日期"
            validateStatus={errors.eventStartDate ? "error" : ""}
            help={errors.eventStartDate?.message}
            className={classes.flexItem}
          >
            <Controller
              name="eventStartDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  placeholder="請選擇開始日期時間"
                  className={classes.fullWidth}
                  size="large"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="賽事結束日期"
            validateStatus={errors.eventEndDate ? "error" : ""}
            help={errors.eventEndDate?.message}
            className={classes.flexItem}
          >
            <Controller
              name="eventEndDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  placeholder="請選擇結束日期時間"
                  className={classes.fullWidth}
                  size="large"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            />
          </Form.Item>
        </Space>

        {/* 報名截止日期 */}
        <Form.Item
          label="報名截止日期"
          validateStatus={errors.registrationDeadline ? "error" : ""}
          help={errors.registrationDeadline?.message}
          className={classes.marginTop}
        >
          <Controller
            name="registrationDeadline"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                placeholder="請選擇報名截止日期時間"
                className={classes.fullWidth}
                size="large"
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            )}
          />
        </Form.Item>

        {/* 賽事狀態 */}
        <Form.Item
          label="賽事狀態"
          validateStatus={errors.status ? "error" : ""}
          help={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} size="large" options={STATUS_OPTIONS} />
            )}
          />
        </Form.Item>

        {/* 最大參賽學校數 & 最大參賽人數 */}
        <Space className={classes.spaceContainer} size="large">
          <Form.Item
            label="最大參賽學校數"
            validateStatus={errors.maxSchools ? "error" : ""}
            help={errors.maxSchools?.message}
            className={classes.flexItem}
          >
            <Controller
              name="maxSchools"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  className={classes.fullWidth}
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="最大參賽人數"
            validateStatus={errors.maxParticipants ? "error" : ""}
            help={errors.maxParticipants?.message}
            className={classes.flexItem}
          >
            <Controller
              name="maxParticipants"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  className={classes.fullWidth}
                  size="large"
                />
              )}
            />
          </Form.Item>
        </Space>

        {/* 比賽地點 */}
        <Form.Item
          label="比賽地點"
          validateStatus={errors.location ? "error" : ""}
          help={errors.location?.message}
          className={classes.marginTop}
        >
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="請輸入比賽地點" size="large" />
            )}
          />
        </Form.Item>

        {/* 聯絡人 & 聯絡電話 */}
        <Space className={classes.spaceContainer} size="large">
          <Form.Item
            label="聯絡人"
            validateStatus={errors.contactPerson ? "error" : ""}
            help={errors.contactPerson?.message}
            className={classes.flexItem}
          >
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="請輸入聯絡人姓名" size="large" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="聯絡電話"
            validateStatus={errors.contactPhone ? "error" : ""}
            help={errors.contactPhone?.message}
            className={classes.flexItem}
          >
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="請輸入聯絡電話" size="large" />
              )}
            />
          </Form.Item>
        </Space>

        {/* 聯絡郵箱 */}
        <Form.Item
          label="聯絡郵箱"
          validateStatus={errors.contactEmail ? "error" : ""}
          help={errors.contactEmail?.message}
          className={classes.marginTop}
        >
          <Controller
            name="contactEmail"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="請輸入聯絡郵箱"
                type="email"
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* 賽事規則 */}
        <Form.Item
          label="賽事規則"
          validateStatus={errors.rules ? "error" : ""}
          help={errors.rules?.message}
          className={classes.marginTop}
        >
          <Controller
            name="rules"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="請輸入賽事規則（選填）"
                rows={4}
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* 獎項資訊 */}
        <Form.Item
          label="獎項資訊"
          validateStatus={errors.prizes ? "error" : ""}
          help={errors.prizes?.message}
        >
          <Controller
            name="prizes"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="請輸入獎項資訊（選填）"
                rows={4}
                size="large"
              />
            )}
          />
        </Form.Item>
      </Form>

      <div className={classes.buttonContainer}>
        <Button key="cancel" onClick={handleCancel} size="large">
          取消
        </Button>

        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit(onSubmit)}
          size="large"
          loading={createEventMutation.isPending}
        >
          創建賽事
        </Button>
      </div>
    </>
  );
};

export default AddEventPage;
