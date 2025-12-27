import { Card, Typography, Spin, Tag, Button } from "antd";
import {
  CalendarOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useEvents } from "./hooks/useEvents";
import { getStatusInfo } from "./helpers/getStatusInfo";
import { formatDateRange } from "./helpers/formatDateRange";
import { Header } from "../../app/components/Header/Header";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const useStyles = createUseStyles({
  pageContainer: {
    padding: 0,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: "32px !important",
    fontWeight: "700 !important",
    color: "#1f1f1f !important",
    margin: "0 !important",
    marginBottom: "8px !important",
  },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(580px, 1fr))",
    gap: 24,
  },
  eventCard: {
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s ease",
    overflow: "hidden",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-2px)",
    },
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  eventTitle: {
    fontSize: "20px !important",
    fontWeight: "600 !important",
    color: "#1f1f1f !important",
    margin: "0 !important",
    marginBottom: "8px !important",
  },
  eventMeta: {
    color: "#6b6b6b",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  progressSection: {
    display: "flex",
    gap: 24,
    marginBottom: 20,
  },
  progressItem: {
    flex: 1,
  },
  progressHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  progressIcon: {
    fontSize: 20,
    color: "#6366f1",
  },
  progressValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f1f1f",
    lineHeight: 1,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: "14px",
    color: "#6b6b6b",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: "#f3f4f6",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
    borderRadius: 4,
    transition: "width 0.8s ease",
  },
  progressText: {
    fontSize: "12px",
    color: "#6b6b6b",
    marginTop: 4,
  },
  cardActions: {
    display: "flex",
    gap: 12,
  },
  detailButton: {
    borderRadius: 8,
    background: "transparent",
    color: "#6366f1",
    border: "1px solid #e2e8f0",
    "&:hover": {
      background: "#f8fafc !important",
      borderColor: "#6366f1 !important",
      color: "#6366f1 !important",
    },
  },
  manageButton: {
    borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    border: "none",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    "&:hover": {
      background:
        "linear-gradient(135deg, #5b5bf6 0%, #7c3aed 100%) !important",
      boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4) !important",
      transform: "translateY(-1px)",
    },
  },
});

const EventListingPage = () => {
  const classes = useStyles();
  const { data: events, isLoading } = useEvents();
  const navigate = useNavigate();

  return (
    <Spin spinning={isLoading}>
      <div className={classes.pageContainer}>
        <Header
          title="賽事管理"
          buttonText="+ 新增賽事"
          onButtonClick={() => {
            navigate("/add-event");
          }}
        />

        <div className={classes.eventsGrid}>
          {events?.map((event) => {
            const participantsProgress =
              event.maxParticipants && event.currentParticipants
                ? Math.round(
                    (event.currentParticipants / event.maxParticipants) * 100
                  )
                : 0;

            const schoolsProgress =
              event.maxSchools && event.currentSchools
                ? Math.round((event.currentSchools / event.maxSchools) * 100)
                : 0;

            const statusInfo = getStatusInfo(event.status);

            return (
              <Card
                key={event.id}
                className={classes.eventCard}
                variant={"outlined"}
              >
                <div className={classes.cardHeader}>
                  <div className={classes.titleSection}>
                    <Title level={3} className={classes.eventTitle}>
                      {event.title}
                    </Title>
                    <div className={classes.eventMeta}>
                      <Text>
                        <CalendarOutlined />
                        {formatDateRange(
                          event.eventStartDate,
                          event.eventEndDate
                        )}
                      </Text>
                    </div>
                  </div>
                  <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                </div>

                <div className={classes.progressSection}>
                  <div className={classes.progressItem}>
                    <div className={classes.progressHeader}>
                      <BankOutlined className={classes.progressIcon} />
                      <Text className={classes.progressLabel}>參賽學校</Text>
                    </div>
                    <div className={classes.progressValue}>
                      {event.currentSchools ?? 0}
                    </div>
                    <Text className={classes.progressLabel}>參賽學校</Text>
                    <div className={classes.progressBar}>
                      <div
                        className={classes.progressFill}
                        style={{ width: `${schoolsProgress}%` }}
                      />
                    </div>
                    <Text className={classes.progressText}>
                      實事進度 {schoolsProgress}%
                    </Text>
                  </div>

                  <div className={classes.progressItem}>
                    <div className={classes.progressHeader}>
                      <TeamOutlined className={classes.progressIcon} />
                      <Text className={classes.progressLabel}>參賽人數</Text>
                    </div>
                    <div className={classes.progressValue}>
                      {event.currentParticipants ?? 0}
                    </div>
                    <Text className={classes.progressLabel}>參賽人數</Text>
                    <div className={classes.progressBar}>
                      <div
                        className={classes.progressFill}
                        style={{ width: `${participantsProgress}%` }}
                      />
                    </div>
                    <Text className={classes.progressText}>
                      實事進度 {participantsProgress}%
                    </Text>
                  </div>
                </div>

                <div className={classes.cardActions}>
                  <Button className={classes.detailButton}>查看詳情</Button>
                  <Button type="primary" className={classes.manageButton}>
                    管理賽事
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Spin>
  );
};

export default EventListingPage;
