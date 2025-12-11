export const dummyTeams = [
  {
    id: '1',
    teamName: 'Alpha Developers',
    members: [
      { id: 'm1', name: 'John Doe', designation: 'Senior Software Engineer', email: 'john.doe@company.com' },
      { id: 'm2', name: 'Jane Smith', designation: 'Software Engineer', email: 'jane.smith@company.com' },
    ],
    supervisor: { id: 's1', name: 'John Doe', designation: 'Senior Software Engineer', email: 'john.doe@company.com' },
  },
  {
    id: '2',
    teamName: 'UI/UX Squad',
    members: [
      { id: 'm3', name: 'Sarah Miller', designation: 'Lead UX Designer', email: 'sarah.miller@company.com' },
      { id: 'm4', name: 'Tom Wilson', designation: 'UI Designer', email: 'tom.wilson@company.com' },
    ],
    supervisor: { id: 's2', name: 'Sarah Miller', designation: 'Lead UX Designer', email: 'sarah.miller@company.com' },
  },
  {
    id: '3',
    teamName: 'CloudOps Team',
    members: [
      { id: 'm5', name: 'Alice Brown', designation: 'DevOps Engineer', email: 'alice.brown@company.com' },
    ],
    supervisor: null,
  },
  {
    id: '4',
    teamName: 'Mobile App Team',
    members: [
      { id: 'm6', name: 'Kevin Wright', designation: 'Mobile Tech Lead', email: 'kevin.wright@company.com' },
      { id: 'm7', name: 'Emily Davis', designation: 'Mobile Developer', email: 'emily.davis@company.com' },
    ],
    supervisor: { id: 's3', name: 'Kevin Wright', designation: 'Mobile Tech Lead', email: 'kevin.wright@company.com' },
  },
  {
    id: '5',
    teamName: 'Support & Maintenance',
    members: [
      { id: 'm8', name: 'Linda Johnson', designation: 'Support Manager', email: 'linda.johnson@company.com' },
      { id: 'm9', name: 'Robert Taylor', designation: 'Support Specialist', email: 'robert.taylor@company.com' },
    ],
    supervisor: { id: 's4', name: 'Linda Johnson', designation: 'Support Manager', email: 'linda.johnson@company.com' },
  },
];
