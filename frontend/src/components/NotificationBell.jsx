import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import "../styles/NotificationBell.scss";

const NOTIFICATION_EVENTS = {
  CREATED: "news:created",
  UPDATED: "news:updated",
  PUBLISHED: "news:published",
  DELETED: "news:deleted",
};

const MAX_NOTIFICATIONS = 10;

function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef(null);

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const addNotification = useCallback(
    (message) => {
      const newNotification = {
        id: Date.now(),
        message,
        time: formatTime(new Date()),
        read: false,
      };

      setNotifications((prev) => [
        newNotification,
        ...prev.slice(0, MAX_NOTIFICATIONS - 1),
      ]);
      setUnreadCount((prev) => prev + 1);
    },
    [formatTime]
  );

  const setupSocketListeners = useCallback(() => {
    const socket = socketRef.current;

    socket.on(NOTIFICATION_EVENTS.CREATED, (news) => {
      addNotification(`Новая статья: ${news.title}`);
    });

    socket.on(NOTIFICATION_EVENTS.UPDATED, (news) => {
      addNotification(`Обновлена статья: ${news.title}`);
    });

    socket.on(NOTIFICATION_EVENTS.PUBLISHED, (news) => {
      addNotification(`Опубликована: ${news.title}`);
    });

    socket.on(NOTIFICATION_EVENTS.DELETED, (data) => {
      addNotification(`Удалена статья #${data.id}`);
    });

    return () => {
      socket.off(NOTIFICATION_EVENTS.CREATED);
      socket.off(NOTIFICATION_EVENTS.UPDATED);
      socket.off(NOTIFICATION_EVENTS.PUBLISHED);
      socket.off(NOTIFICATION_EVENTS.DELETED);
    };
  }, [addNotification]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
    });

    setupSocketListeners();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, setupSocketListeners]);

  const handleBellClick = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));
      setUnreadCount(0);
    }
  }, [isOpen, unreadCount]);

  const NotificationItem = ({ note }) => (
    <li className={`notification-item ${note.read ? "read" : ""}`}>
      <div className="notification-content">{note.message}</div>
      <div className="notification-time">{note.time}</div>
    </li>
  );

  return (
    <div className="notification-bell">
      <button
        onClick={handleBellClick}
        className="bell-button"
        aria-label="Уведомления"
        aria-expanded={isOpen}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <h3>Уведомления</h3>
          {notifications.length === 0 ? (
            <p className="no-notifications">Нет новых уведомлений</p>
          ) : (
            <ul className="notification-list" aria-live="polite">
              {notifications.map((note) => (
                <NotificationItem key={note.id} note={note} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
