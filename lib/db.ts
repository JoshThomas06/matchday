import fs from 'fs';
import path from 'path';

export interface Poll {
  id: string;
  matchId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  voters: string[]; // array of userIds
  createdAt: number;
  closesAt: number;
  closed: boolean;
  triggerEvent: string;
}

export interface UserStats {
  userId: string;
  points: number;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  history: any[];
}

interface DBData {
  polls: Poll[];
  users: Record<string, UserStats>;
  pollSeq: number;
}

const dbPath = path.join(process.cwd(), 'predictions_db.json');

const defaultData: DBData = {
  polls: [],
  users: {},
  pollSeq: 0,
};

function readDB(): DBData {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data) as DBData;
    }
  } catch (e) {
    console.error('Error reading DB:', e);
  }
  return defaultData;
}

function writeDB(data: DBData) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing DB:', e);
  }
}

export const db = {
  getPolls: (): Poll[] => {
    return readDB().polls;
  },
  savePoll: (poll: Poll) => {
    const data = readDB();
    const existingIndex = data.polls.findIndex(p => p.id === poll.id);
    if (existingIndex >= 0) {
      data.polls[existingIndex] = poll;
    } else {
      data.polls.push(poll);
    }
    writeDB(data);
  },
  getPoll: (id: string): Poll | undefined => {
    return readDB().polls.find(p => p.id === id);
  },
  getNextPollSeq: (): number => {
    const data = readDB();
    data.pollSeq += 1;
    writeDB(data);
    return data.pollSeq;
  },
  getUser: (userId: string): UserStats => {
    const data = readDB();
    return data.users[userId] || {
      userId,
      points: 0,
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      history: []
    };
  },
  updateUser: (user: UserStats) => {
    const data = readDB();
    data.users[user.userId] = user;
    writeDB(data);
  },
  getAllUsers: (): UserStats[] => {
    const data = readDB();
    return Object.values(data.users);
  }
};
