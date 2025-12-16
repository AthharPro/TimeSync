import { IEmployee } from '../interfaces/user/IUser';

// optional: export a lightweight type for your simple mocks
export type SimpleItem = { id: string; name: string };

// raw simple mocks (easy to author)
export const mockEmployees: IEmployee[] = [
  { _id: 'emp1', id: 'emp1', name: 'Chamara Perera', firstName: 'Chamara', lastName: 'Perera', email: 'chamara@example.com' },
  { _id: 'emp2', id: 'emp2', name: 'Rashmitha Dilshan', firstName: 'Rashmitha', lastName: 'Dilshan', email: 'rashmitha@example.com' },
  { _id: 'emp3', id: 'emp3', name: 'Kasuni Sandamali', firstName: 'Kasuni', lastName: 'Sandamali', email: 'kasuni@example.com' },
  { _id: 'emp4', id: 'emp4', name: 'Tharindu Prabath', firstName: 'Tharindu', lastName: 'Prabath', email: 'tharindu@example.com' },
];

export const mockTeamsRaw: SimpleItem[] = [
  { id: 'team1', name: 'Frontend Team' },
  { id: 'team2', name: 'Backend Team' },
  { id: 'team3', name: 'QA Team' },
];

export const mockProjectsRaw: SimpleItem[] = [
  { id: 'project1', name: 'Ruh Internship Portal' },
  { id: 'project2', name: 'Eco360X App' },
  { id: 'project3', name: 'Inventory Control System' },
];

// helper to map simple items to ProjectTeamItem-like shape
export const toProjectTeamItem = (items: SimpleItem[]) =>
  items.map(item => ({
    ...item,
    _id: item.id,       // add _id as required
    userCount: 0,       // default user count (you can change later)
  }));

// exports ready to pass straight into ProjectTeamSelect
export const mockTeams = toProjectTeamItem(mockTeamsRaw);
export const mockProjects = toProjectTeamItem(mockProjectsRaw);
