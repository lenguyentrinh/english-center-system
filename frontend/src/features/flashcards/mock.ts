import { MOCK_TEACHER } from "@/features/mock/common.ts";
import type { Card, Deck, Rating, StudentDeckProgress } from "./types.ts";

export const STUDENT_CLASS_IDS = ["c1", "c3"];
export const OTHER_TEACHER = { id: "t2", name: "Thầy Minh Quân" } as const;

export const CLASS_STUDENT_COUNT: Record<string, number> = { c1: 14, c2: 12, c3: 10 };

export const MOCK_STUDENT_NAMES = [
  "Minh Anh", "Gia Bảo", "Khánh Linh", "Đức Huy", "Thảo Nguyên", "Quang Minh", "Phương Vy",
  "Hoàng Nam", "Bảo Ngọc", "Tuấn Kiệt", "Mai Chi", "Thanh Tùng", "Ngọc Hân", "Việt Anh",
];

type Seed = [word: string, ipa: string, pos: string, meaning: string, synonym: string, example: string, exampleVi: string];

const mk = (prefix: string, seeds: Seed[]): Card[] =>
  seeds.map(([word, ipa, pos, meaning, synonym, example, exampleVi], i) => ({
    id: `${prefix}-${i + 1}`,
    word,
    ipa,
    pos,
    meaning,
    synonym,
    example,
    exampleVi,
  }));

const IELTS = mk("d1", [
  ["Ubiquitous", "/juːˈbɪkwɪtəs/", "tính từ", "Có mặt ở khắp nơi", "widespread", "Smartphones have become ubiquitous in modern life.", "Điện thoại thông minh đã trở nên phổ biến khắp nơi."],
  ["Mitigate", "/ˈmɪtɪɡeɪt/", "động từ", "Làm giảm nhẹ", "alleviate", "Planting trees can mitigate the effects of pollution.", "Trồng cây có thể giảm nhẹ tác động của ô nhiễm."],
  ["Substantial", "/səbˈstænʃl/", "tính từ", "Đáng kể, lớn", "considerable", "There has been a substantial increase in tourism.", "Du lịch đã tăng lên đáng kể."],
  ["Inevitable", "/ɪnˈevɪtəbl/", "tính từ", "Không thể tránh khỏi", "unavoidable", "Change is inevitable in any growing city.", "Thay đổi là điều tất yếu ở mọi thành phố đang phát triển."],
  ["Deteriorate", "/dɪˈtɪəriəreɪt/", "động từ", "Trở nên tệ hơn", "decline", "Air quality tends to deteriorate in winter.", "Chất lượng không khí thường xấu đi vào mùa đông."],
  ["Advocate", "/ˈædvəkeɪt/", "động từ", "Ủng hộ, cổ vũ", "support", "Many experts advocate a four-day working week.", "Nhiều chuyên gia ủng hộ tuần làm việc bốn ngày."],
]);

const COLLOC = mk("d2", [
  ["Raise awareness", "/reɪz əˈweənəs/", "cụm từ", "Nâng cao nhận thức", "inform", "Campaigns raise awareness of climate change.", "Các chiến dịch nâng cao nhận thức về biến đổi khí hậu."],
  ["Pose a threat", "/pəʊz ə θret/", "cụm từ", "Gây ra mối đe doạ", "endanger", "Plastic waste poses a threat to marine life.", "Rác thải nhựa gây nguy hiểm cho sinh vật biển."],
  ["Play a role", "/pleɪ ə rəʊl/", "cụm từ", "Đóng vai trò", "contribute", "Education plays a vital role in development.", "Giáo dục đóng vai trò quan trọng trong phát triển."],
  ["Take measures", "/teɪk ˈmeʒəz/", "cụm từ", "Thực hiện biện pháp", "act", "Governments must take measures to cut emissions.", "Chính phủ phải thực hiện biện pháp cắt giảm khí thải."],
  ["Reach a consensus", "/riːtʃ ə kənˈsensəs/", "cụm từ", "Đạt được sự đồng thuận", "agree", "The committee reached a consensus on the plan.", "Uỷ ban đã đạt được đồng thuận về kế hoạch."],
]);

const TOEIC = mk("d3", [
  ["Invoice", "/ˈɪnvɔɪs/", "danh từ", "Hoá đơn", "bill", "Please send the invoice to our accounting team.", "Vui lòng gửi hoá đơn cho bộ phận kế toán."],
  ["Reimburse", "/ˌriːɪmˈbɜːs/", "động từ", "Hoàn trả chi phí", "repay", "The company will reimburse your travel expenses.", "Công ty sẽ hoàn trả chi phí đi lại cho bạn."],
  ["Itinerary", "/aɪˈtɪnərəri/", "danh từ", "Lịch trình chuyến đi", "schedule", "Your itinerary includes two days in Singapore.", "Lịch trình của bạn có hai ngày ở Singapore."],
  ["Postpone", "/pəˈspəʊn/", "động từ", "Hoãn lại", "delay", "The meeting was postponed until next Monday.", "Cuộc họp được hoãn đến thứ Hai tuần sau."],
  ["Revenue", "/ˈrevənjuː/", "danh từ", "Doanh thu", "income", "Revenue grew by 12 percent last quarter.", "Doanh thu tăng 12% trong quý trước."],
  ["Deadline", "/ˈdedlaɪn/", "danh từ", "Hạn chót", "due date", "The deadline for applications is Friday.", "Hạn nộp hồ sơ là thứ Sáu."],
]);

const COMM = mk("d4", [
  ["Catch up", "/kætʃ ʌp/", "cụm động từ", "Gặp lại để hàn huyên", "reconnect", "Let's catch up over coffee this weekend.", "Cuối tuần này gặp nhau uống cà phê nhé."],
  ["Running late", "/ˈrʌnɪŋ leɪt/", "cụm từ", "Đang bị trễ giờ", "behind schedule", "Sorry, I'm running late.", "Xin lỗi, mình đang bị trễ."],
  ["Figure out", "/ˈfɪɡə aʊt/", "cụm động từ", "Tìm ra, hiểu ra", "work out", "I can't figure out how this works.", "Mình không hiểu cái này hoạt động thế nào."],
  ["Grab a bite", "/ɡræb ə baɪt/", "thành ngữ", "Ăn nhanh một chút", "have a snack", "Want to grab a bite after class?", "Tan học đi ăn chút gì không?"],
  ["Hang out", "/hæŋ aʊt/", "cụm động từ", "Đi chơi, tụ tập", "spend time", "We usually hang out at the park on Sundays.", "Tụi mình hay đi chơi ở công viên vào Chủ Nhật."],
  ["Look forward to", "/lʊk ˈfɔːwəd tə/", "cụm từ", "Mong chờ điều gì", "anticipate", "I look forward to meeting you.", "Mình rất mong được gặp bạn."],
]);

const LINKERS = mk("d5", [
  ["Nevertheless", "/ˌnevəðəˈles/", "trạng từ", "Tuy nhiên", "however", "The plan was risky; nevertheless, we went ahead.", "Kế hoạch rủi ro; tuy vậy chúng tôi vẫn tiến hành."],
  ["Consequently", "/ˈkɒnsɪkwəntli/", "trạng từ", "Do đó", "therefore", "Sales fell; consequently, prices were cut.", "Doanh số giảm; do đó giá được giảm."],
  ["Moreover", "/mɔːrˈəʊvə/", "trạng từ", "Hơn nữa", "furthermore", "The course is cheap; moreover, it is flexible.", "Khoá học rẻ; hơn nữa lại linh hoạt."],
  ["Whereas", "/weərˈæz/", "liên từ", "Trong khi (đối lập)", "while", "Some like cities, whereas others prefer villages.", "Có người thích thành phố, trong khi người khác thích làng quê."],
]);

const VERBS = mk("d6", [
  ["Submit", "/səbˈmɪt/", "động từ", "Nộp", "hand in", "Please submit the report by noon.", "Vui lòng nộp báo cáo trước trưa."],
  ["Approve", "/əˈpruːv/", "động từ", "Phê duyệt", "authorize", "The manager approved the budget.", "Quản lý đã phê duyệt ngân sách."],
  ["Resume", "/rɪˈzjuːm/", "động từ", "Tiếp tục lại", "restart", "Work will resume on Monday.", "Công việc sẽ tiếp tục vào thứ Hai."],
  ["Acquire", "/əˈkwaɪə/", "động từ", "Mua lại, giành được", "obtain", "The firm acquired a smaller rival.", "Công ty đã mua lại một đối thủ nhỏ hơn."],
]);

const T = MOCK_TEACHER;
const O = OTHER_TEACHER;

export const SEED_DECKS: Deck[] = [
  { id: "d1", title: "IELTS Academic Vocabulary", classId: "c1", published: true, authorId: T.id, authorName: T.name, cards: IELTS },
  { id: "d2", title: "IELTS Collocations", classId: "c1", published: true, authorId: T.id, authorName: T.name, cards: COLLOC },
  { id: "d3", title: "TOEIC Office Essentials", classId: "c2", published: true, authorId: T.id, authorName: T.name, cards: TOEIC },
  { id: "d4", title: "Giao tiếp hằng ngày", classId: "c3", published: false, authorId: T.id, authorName: T.name, cards: COMM },
  { id: "d5", title: "IELTS Writing Linkers", classId: "c1", published: true, authorId: O.id, authorName: O.name, cards: LINKERS },
  { id: "d6", title: "TOEIC Part 5 Verbs", classId: "c2", published: true, authorId: O.id, authorName: O.name, cards: VERBS },
];

export const SEED_PROGRESS: Record<string, StudentDeckProgress> = {
  d1: { fresh: 4, learning: 1, review: 2, studiedToday: false, test: { correct: 5, total: 6 } },
  d2: { fresh: 0, learning: 0, review: 0, studiedToday: true, test: null },
  d5: { fresh: 4, learning: 0, review: 0, studiedToday: false, test: null },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Number of students who already reviewed the deck (0 for drafts). */
export function studentsDoneFor(deck: Deck): number {
  if (!deck.published) return 0;
  const total = CLASS_STUDENT_COUNT[deck.classId] ?? 10;
  return Math.max(0, total - 3 + (hash(deck.id) % 3));
}

/** Deterministic mock rating, null when the student has not reviewed the deck. */
export function mockRating(deck: Deck, studentIdx: number, card: Card): Rating | null {
  if (studentIdx >= studentsDoneFor(deck)) return null;
  const r = hash(`${card.id}:${studentIdx}`) % 100;
  if (r < 12) return "again";
  if (r < 30) return "hard";
  if (r < 72) return "good";
  return "easy";
}
