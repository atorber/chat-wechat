// 以下类型定义MessageActions类型的对象的结构，该对象表示请求的消息操作的列表

// 【2023年8月8日晚上10点】提醒【大李】：明天上午8点去接王总
export type ScheduledTasksMessage = {
    // Some message content, such as coming to the meeting immediately and picking up the delivery at the door
    text: string;
    // a list of people like 'team'
    contacts: string[];
    // 根据时间生成的cron表达式，例如：每天上午8点执行任务则 cron表示为 0 0 8 * * *
    cron:string;
    // 时间周期，例如每天上午8点
    time:string;
};

// 【2023年8月8日晚上10点】提醒群【全体员工】：明天上午8点去接王总
export type ScheduledTasksRooMMessage = {
    // Some message content, such as coming to the meeting immediately and picking up the delivery at the door
    text: string;
    // a list of people like 'team'
    rooms: string[];
    // 根据时间生成的cron表达式，例如：每天上午8点执行任务则 cron表示为 0 0 8 * * *
    cron:string;
    // 时间周期，例如每天上午8点
    time:string;
};

// 通知【xxx】：会议取消了、告诉【xxx】：会议取消了
export type Message = {
    // Some message content, such as coming to the meeting immediately and picking up the delivery at the door
    text: string;
    // a list of people like 'team'
    contacts: string[];
};

// 通知群【xxx】：会议取消了、群【xxx】：会议取消了
export type RoomMessage = {
    // Some message content, such as coming to the meeting immediately and picking up the delivery at the door
    text: string;
    // a list of room or named groups like 'team'
    rooms: string[];
};

export type SendMessageAction = {
    // 向某人发送消息或通知某人
    actionType: 'sendMessage';
    event: Message;
};

export type SendRoomMessageAction = {
    // 向某个群发送消息或向某个群发通知
    actionType: 'sendRoomMessage';
    event: RoomMessage;
};

export type ScheduledTasksMessageAction = {
    // 定时向某个好友发送消息或向某个群发通知
    actionType: 'scheduledTasksMessage';
    event: ScheduledTasksMessage;
};

export type ScheduledTasksRoomMessageAction = {
    // 定时向某个好友发送消息或向某个群发通知
    actionType: 'scheduledTasksRoomMessage';
    event: ScheduledTasksRoomMessageAction;
};

// if the user types text that can not easily be understood as a calendar action, this action is used
export interface UnknownAction {
    actionType: 'unknown';
    // text typed by the user that the system did not understand
    text: string;
}

export type Action =
    | UnknownAction
    | SendRoomMessageAction
    | SendMessageAction
    | ScheduledTasksRoomMessageAction
    | ScheduledTasksMessageAction;

export type MessageActions = {
    actions: Action[];
};
