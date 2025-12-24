import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const eventSchema = z.object({
  title: z.string().min(1, "請輸入賽事名稱"),
  description: z.string().min(1, "請輸入賽事描述"),
  eventDate: z.tuple([z.any(), z.any()]).optional(),
  registrationDeadline: z
    .any()
    .refine((val) => val !== null, "請選擇報名截止日期"),
  status: z.string().min(1, "請選擇賽事狀態"),
  maxSchools: z.number().min(1, "最大參賽學校數至少為1"),
  maxParticipants: z.number().min(1, "最大參賽人數至少為1"),
  location: z.string().min(1, "請輸入比賽地點"),
  contactPerson: z.string().min(1, "請輸入聯絡人"),
  contactPhone: z.string().min(1, "請輸入聯絡電話"),
  contactEmail: z.string().email("請輸入有效的電子郵件"),
});

type EventForm = z.infer<typeof eventSchema>;

const useStyles = createUseStyles({
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

const AddEventPage = () => {
  const classes = useStyles();
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
      eventDate: undefined,
      registrationDeadline: null,
      status: "籌備中",
      maxSchools: 20,
      maxParticipants: 400,
      location: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
    },
  });

  const onSubmit: SubmitHandler<EventForm> = async (data) => {
    try {
      console.log("提交的數據:", data);
      notification.success({
        message: "創建成功",
        description: "賽事已成功創建",
      });
    } catch (error) {
      notification.error({
        message: "創建失敗",
        description: "請稍後再試或聯絡管理員",
      });
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
          help={errors.title?.message || undefined}
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
          help={errors.description?.message || undefined}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="請輸入賽事描述（選填）"
                rows={4}
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* 賽事日期 */}
        <Form.Item
          label="賽事日期"
          validateStatus={errors.eventDate ? "error" : ""}
          help={errors.eventDate?.message || undefined}
        >
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                {...field}
                placeholder={["開始日期", "結束日期"]}
                className={classes.fullWidth}
                size="large"
                format="YYYY-MM-DD"
              />
            )}
          />
        </Form.Item>

        {/* 報名截止日期 */}
        <Form.Item
          label="報名截止日期"
          validateStatus={errors.registrationDeadline ? "error" : ""}
          help={
            typeof errors.registrationDeadline?.message === "string"
              ? errors.registrationDeadline.message
              : undefined
          }
        >
          <Controller
            name="registrationDeadline"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                placeholder="請選擇報名愰止日期"
                className={classes.fullWidth}
                size="large"
                format="YYYY-MM-DD"
              />
            )}
          />
        </Form.Item>

        {/* 賽事狀態 */}
        <Form.Item
          label="賽事狀態"
          validateStatus={errors.status ? "error" : ""}
          help={errors.status?.message || undefined}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  { value: "籌備中", label: "籌備中" },
                  { value: "報名中", label: "報名中" },
                  { value: "進行中", label: "進行中" },
                  { value: "已結束", label: "已結束" },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* 最大參賽學校數 & 最大參賽人數 */}
        <Space className={classes.spaceContainer} size="large">
          <Form.Item
            label="最大參賽學校數"
            validateStatus={errors.maxSchools ? "error" : ""}
            help={errors.maxSchools?.message || undefined}
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
            help={errors.maxParticipants?.message || undefined}
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
          help={errors.location?.message || undefined}
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
            help={errors.contactPerson?.message || undefined}
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
            help={errors.contactPhone?.message || undefined}
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
          help={errors.contactEmail?.message || undefined}
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
        >
          創建賽事
        </Button>
      </div>
    </>
  );
};

export default AddEventPage;
