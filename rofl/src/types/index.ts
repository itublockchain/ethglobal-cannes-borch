export interface GroupCreatedEvent {
  groupId: bigint;
  creator: string;
  members: string[];
}

export interface CardInfo {
  cardNo: string;
  cvv: string;
  expireDate: string;
} 