import { useState, useMemo } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { Button, Popconfirm, Card, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Event as CalendarEvent } from "react-big-calendar";
import { ScheduleModal, type CustomEvent } from "./ScheduleModal";

// Set dayjs locale to Chinese
dayjs.locale("zh-tw");

const { Title } = Typography;

// Configure dayjs for react-big-calendar
const localizer = dayjsLocalizer(dayjs);

const useStyles = createUseStyles({
  calendarContainer: {
    height: 600,
    marginTop: 24,
  },
  headerActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    marginBottom: 24,
  },
  eventList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  eventItem: {
    padding: 12,
    border: "1px solid #f0f0f0",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: 600,
    marginBottom: 4,
  },
  eventTime: {
    color: "#6b6b6b",
    fontSize: "14px",
  },
  eventActions: {
    display: "flex",
    gap: 8,
  },
});

type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";

interface EventCalendarProps {
  eventId: string;
}

export const EventCalendar = ({ eventId }: EventCalendarProps) => {
  // eventId is reserved for future backend integration
  void eventId; // Suppress unused variable warning
  const classes = useStyles();
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null);
  const [modalInitialValues, setModalInitialValues] = useState<{
    startDate?: dayjs.Dayjs;
    startTime?: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
    endTime?: dayjs.Dayjs;
    allDay?: boolean;
  }>();
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert CustomEvent to CalendarEvent for react-big-calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay || false,
      resource: event,
    }));
  }, [events]);

  const handleAddEvent = (slotInfo?: { start: Date; end: Date }) => {
    setEditingEvent(null);

    // If slot info is provided (from calendar selection), pre-fill the dates
    if (slotInfo) {
      // Check if it's a multi-day selection
      const startDay = dayjs(slotInfo.start).startOf("day");
      const endDay = dayjs(slotInfo.end).startOf("day");
      const isMultiDay = !startDay.isSame(endDay);

      setModalInitialValues({
        startDate: dayjs(slotInfo.start),
        startTime: dayjs(slotInfo.start),
        endDate: dayjs(slotInfo.end).subtract(1, "day"), // react-big-calendar end is exclusive
        endTime: dayjs(slotInfo.end),
        allDay: isMultiDay, // Default to all-day for multi-day selection
      });
    } else {
      setModalInitialValues(undefined);
    }

    setIsModalVisible(true);
  };

  const handleEditEvent = (event: CustomEvent) => {
    setEditingEvent(event);
    setModalInitialValues(undefined);
    setIsModalVisible(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const generateRecurringEvents = (
    baseEvent: Omit<CustomEvent, "id">,
    recurrence: RecurrenceType,
    occurrences: number,
    recurrenceGroupId: string
  ): CustomEvent[] => {
    const events: CustomEvent[] = [];
    const duration = dayjs(baseEvent.end).diff(dayjs(baseEvent.start));

    for (let i = 0; i < occurrences; i++) {
      let newStart: dayjs.Dayjs;

      switch (recurrence) {
        case "daily":
          newStart = dayjs(baseEvent.start).add(i, "day");
          break;
        case "weekly":
          newStart = dayjs(baseEvent.start).add(i, "week");
          break;
        case "biweekly":
          newStart = dayjs(baseEvent.start).add(i * 2, "week");
          break;
        case "monthly":
          newStart = dayjs(baseEvent.start).add(i, "month");
          break;
        default:
          newStart = dayjs(baseEvent.start);
      }

      const newEnd = newStart.add(duration, "millisecond");

      events.push({
        ...baseEvent,
        id: `event-${Date.now()}-${i}`,
        start: newStart.toDate(),
        end: newEnd.toDate(),
        recurrenceGroupId,
      });
    }

    return events;
  };

  const handleSaveEvent = (values: {
    title: string;
    description?: string;
    startDate: dayjs.Dayjs;
    startTime?: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    endTime?: dayjs.Dayjs;
    allDay: boolean;
    recurrence?: RecurrenceType;
    occurrences?: number;
  }) => {
    const {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      allDay,
      recurrence = "none",
      occurrences = 1,
    } = values;

    let start: Date;
    let end: Date;

    if (allDay) {
      start = dayjs(startDate).startOf("day").toDate();
      end = dayjs(endDate || startDate)
        .endOf("day")
        .toDate();
    } else {
      const startDateStr = dayjs(startDate).format("YYYY-MM-DD");
      const endDateStr = dayjs(endDate || startDate).format("YYYY-MM-DD");
      start = dayjs(
        `${startDateStr} ${dayjs(startTime).format("HH:mm")}`
      ).toDate();
      end = dayjs(`${endDateStr} ${dayjs(endTime).format("HH:mm")}`).toDate();
    }

    const baseEventData: Omit<CustomEvent, "id"> = {
      title,
      description,
      start,
      end,
      allDay,
    };

    if (editingEvent) {
      // 編輯時只更新單一事件
      const eventData: CustomEvent = {
        ...baseEventData,
        id: editingEvent.id,
        recurrenceGroupId: editingEvent.recurrenceGroupId,
      };
      setEvents(events.map((e) => (e.id === editingEvent.id ? eventData : e)));
    } else {
      // 新增事件
      if (recurrence !== "none" && occurrences > 1) {
        const recurrenceGroupId = `group-${Date.now()}`;
        const newEvents = generateRecurringEvents(
          baseEventData,
          recurrence,
          occurrences,
          recurrenceGroupId
        );
        setEvents([...events, ...newEvents]);
      } else {
        const eventData: CustomEvent = {
          ...baseEventData,
          id: `event-${Date.now()}`,
        };
        setEvents([...events, eventData]);
      }
    }

    setIsModalVisible(false);
    setEditingEvent(null);
    setModalInitialValues(undefined);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEvent(null);
    setModalInitialValues(undefined);
  };

  // Group events by date for list view
  // For multi-day events, show them on all days they span
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, CustomEvent[]> = {};
    events.forEach((event) => {
      const startDate = dayjs(event.start).startOf("day");
      const endDate = dayjs(event.end).startOf("day");
      let currentDate = startDate;

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
        const dateKey = currentDate.format("YYYY-MM-DD");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
        currentDate = currentDate.add(1, "day");
      }
    });
    return grouped;
  }, [events]);

  return (
    <div>
      <div className={classes.headerActions}>
        <Title level={4} style={{ margin: 0 }}>
          賽事行程
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddEvent()}
        >
          新增行程
        </Button>
      </div>

      <Card className={classes.eventCard}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={currentView}
          date={currentDate}
          onView={setCurrentView}
          onNavigate={setCurrentDate}
          onSelectEvent={(event: CalendarEvent) => {
            const customEvent = event.resource as CustomEvent;
            if (customEvent) {
              handleEditEvent(customEvent);
            }
          }}
          onSelectSlot={(slotInfo: { start: Date; end: Date }) => {
            handleAddEvent(slotInfo);
          }}
          selectable
          messages={{
            next: "下一頁",
            previous: "上一頁",
            today: "今天",
            month: "月",
            week: "週",
            day: "日",
            agenda: "議程",
            date: "日期",
            time: "時間",
            event: "事件",
            noEventsInRange: "此範圍內沒有事件",
          }}
        />
      </Card>

      {Object.keys(groupedEvents).length > 0 && (
        <Card className={classes.eventCard} style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            行程列表
          </Title>
          <div className={classes.eventList}>
            {Object.entries(groupedEvents)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, dateEvents]) => (
                <div key={date}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      color: "#6366f1",
                    }}
                  >
                    {dayjs(date).format("YYYY年MM月DD日 (dddd)")}
                  </div>
                  {dateEvents.map((event) => (
                    <div key={event.id} className={classes.eventItem}>
                      <div className={classes.eventInfo}>
                        <div className={classes.eventTitle}>{event.title}</div>
                        <div className={classes.eventTime}>
                          {event.allDay
                            ? dayjs(event.start).format("YYYY-MM-DD") ===
                              dayjs(event.end).format("YYYY-MM-DD")
                              ? "全天"
                              : `${dayjs(event.start).format(
                                  "YYYY-MM-DD"
                                )} 至 ${dayjs(event.end).format("YYYY-MM-DD")}`
                            : dayjs(event.start).format("YYYY-MM-DD") ===
                              dayjs(event.end).format("YYYY-MM-DD")
                            ? `${dayjs(event.start).format("HH:mm")} - ${dayjs(
                                event.end
                              ).format("HH:mm")}`
                            : `${dayjs(event.start).format(
                                "YYYY-MM-DD HH:mm"
                              )} 至 ${dayjs(event.end).format(
                                "YYYY-MM-DD HH:mm"
                              )}`}
                        </div>
                        {event.description && (
                          <div
                            style={{
                              marginTop: 4,
                              color: "#6b6b6b",
                              fontSize: "13px",
                            }}
                          >
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className={classes.eventActions}>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditEvent(event)}
                        >
                          編輯
                        </Button>
                        <Popconfirm
                          title="確定要刪除這個行程嗎？"
                          onConfirm={() => handleDeleteEvent(event.id)}
                          okText="確定"
                          cancelText="取消"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />}>
                            刪除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </Card>
      )}

      <ScheduleModal
        open={isModalVisible}
        editingEvent={editingEvent}
        onSave={handleSaveEvent}
        onCancel={handleCancel}
        initialValues={modalInitialValues}
      />
    </div>
  );
};
