import { Tabs, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../app/components/Header/Header";
import { EventAccessRights } from "./components/EventAccessRights";
import { EventCalendar } from "./components/EventCalendar";
import { ChatRoom } from "./components/ChatRoom";

const useStyles = createUseStyles({
  pageContainer: {
    padding: 0,
  },
  backButton: {
    marginBottom: 16,
  },
  tabsContainer: {
    marginTop: 24,
  },
});

const EventSummaryPage = () => {
  const classes = useStyles();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  if (!eventId) {
    return <div>無效的賽事 ID</div>;
  }

  const tabItems = [
    {
      key: "calendar",
      label: "行程管理",
      children: <EventCalendar eventId={eventId} />,
    },
    {
      key: "chat",
      label: "聊天室",
      children: <ChatRoom eventId={eventId} />,
    },
    {
      key: "roles",
      label: "管理角色",
      children: <EventAccessRights eventId={eventId} />,
    },
  ];

  return (
    <>
      <div className={classes.pageContainer}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/events")}
          className={classes.backButton}
        >
          返回賽事列表
        </Button>

        <Header title="賽事管理" />

        <div className={classes.tabsContainer}>
          <Tabs items={tabItems} />
        </div>
      </div>
    </>
  );
};

export default EventSummaryPage;
