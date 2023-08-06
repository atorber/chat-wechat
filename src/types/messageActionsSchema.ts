// The following types define the structure of an object of type MessageActions that represents a list of requested message actions

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

// if the user types text that can not easily be understood as a calendar action, this action is used
export interface UnknownAction {
    actionType: 'unknown';
    // text typed by the user that the system did not understand
    text: string;
}

export type Action =
    | UnknownAction
    | SendRoomMessageAction
    | SendMessageAction;

export type MessageActions = {
    actions: Action[];
};
