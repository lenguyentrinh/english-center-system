import type { WRQuestion, WRResult, WRSet } from "./types.ts";

let n = 0;
const q = (sentence: string, options: string[], answer: number, topic: string, hint: string, explain: string): WRQuestion => ({
  id: `q${++n}`,
  sentence,
  options,
  answer,
  topic,
  hint,
  explain,
});

const GRAMMAR: WRQuestion[] = [
  q("She has been working here ___ 2019.", ["since", "for", "from", "during"], 0, "Hiện tại hoàn thành", "Theo sau là một mốc thời gian", "“since” + mốc thời gian (2019); “for” + khoảng thời gian (5 years)."),
  q("If I ___ more time, I would travel the world.", ["have", "had", "will have", "would have"], 1, "Câu điều kiện loại 2", "Giả định trái với hiện tại", "Loại 2: If + quá khứ đơn, would + V nguyên mẫu."),
  q("The meeting was ___ until next Monday.", ["postponed", "delayed on", "cancelled for", "moved off"], 0, "Từ vựng TOEIC", "Nghĩa là “hoãn lại”", "“postpone until + thời điểm” = hoãn đến lúc nào."),
  q("He is very interested ___ learning Japanese.", ["on", "at", "in", "for"], 2, "Giới từ", "Cụm cố định với “interested”", "be interested in + V-ing / danh từ."),
  q("Despite ___ tired, she finished the report.", ["she was", "being", "to be", "be"], 1, "Liên từ nhượng bộ", "“Despite” không đi với mệnh đề", "Despite + V-ing / danh từ. Muốn dùng mệnh đề thì đổi sang “Although”."),
  q("Smartphones have become ___ in modern life.", ["ambiguous", "unanimous", "obsolete", "ubiquitous"], 3, "Từ vựng IELTS", "Có mặt ở khắp nơi", "“ubiquitous” = phổ biến khắp nơi. “obsolete” = lỗi thời."),
  q("Please ___ the form and return it by Friday.", ["fill on", "fill in", "fill at", "fill with"], 1, "Cụm động từ", "Điền thông tin vào mẫu", "“fill in / fill out a form” = điền vào mẫu đơn."),
  q("By the time we arrived, the film ___.", ["has started", "starts", "had started", "was start"], 2, "Quá khứ hoàn thành", "Xảy ra trước một hành động quá khứ", "By the time + quá khứ đơn → mệnh đề chính dùng had + V3."),
  q("This is the ___ book I have ever read.", ["most interesting", "more interesting", "interestingest", "most interested"], 0, "So sánh nhất", "Tính từ dài, mô tả sự vật", "the most + tính từ dài. “interesting” tả vật, “interested” tả cảm xúc người."),
  q("I look forward to ___ from you soon.", ["hear", "heard", "be hearing", "hearing"], 3, "Giao tiếp trang trọng", "“to” ở đây là giới từ", "look forward to + V-ing."),
];

const VOCAB: WRQuestion[] = [
  q("Governments must act to ___ the effects of climate change.", ["mitigate", "deteriorate", "advocate", "neglect"], 0, "Unit 6", "Làm giảm nhẹ", "“mitigate the effects” = giảm nhẹ tác động."),
  q("There has been a ___ increase in plastic waste.", ["substantial", "inevitable", "fragile", "reluctant"], 0, "Unit 6", "Đáng kể", "“a substantial increase” = tăng đáng kể."),
  q("Online learning offers greater ___ for working adults.", ["flexibility", "hostility", "scarcity", "ambiguity"], 0, "Unit 7", "Tính linh hoạt", "“flexibility” = sự linh hoạt."),
  q("The study aims to ___ the link between sleep and memory.", ["investigate", "postpone", "withdraw", "sacrifice"], 0, "Unit 7", "Nghiên cứu, điều tra", "“investigate a link” = nghiên cứu mối liên hệ."),
  q("Rapid urbanisation has put ___ on public transport.", ["pressure", "treasure", "measure", "pleasure"], 0, "Unit 8", "Áp lực", "“put pressure on” = gây áp lực lên."),
  q("Many species are ___ extinction because of habitat loss.", ["at risk of", "in favour of", "on behalf of", "in charge of"], 0, "Unit 8", "Có nguy cơ", "“at risk of” = có nguy cơ."),
];

const TOEIC: WRQuestion[] = [
  q("Employees must submit their expense reports ___ the end of the month.", ["by", "since", "during", "among"], 0, "TOEIC Part 5", "Hạn chót", "“by + mốc” = chậm nhất vào lúc đó."),
  q("The new policy will take ___ next quarter.", ["effect", "affect", "effective", "effection"], 0, "TOEIC Part 5", "Cụm cố định", "“take effect” = có hiệu lực."),
  q("Ms. Tran is responsible ___ training new staff.", ["for", "to", "at", "with"], 0, "TOEIC Part 5", "Giới từ đi với responsible", "be responsible for + V-ing."),
  q("The shipment was delayed ___ bad weather.", ["because of", "because", "although", "so that"], 0, "TOEIC Part 5", "Theo sau là danh từ", "because of + danh từ; because + mệnh đề."),
];

export const SEED_SETS: WRSet[] = [
  { id: "s1", title: "Ngữ pháp tổng hợp · tuần 42", classId: "c1", authorId: "t1", authorName: "Cô Lan Anh", selfPaced: true, mode: "game", testMin: 10, deadline: "2026-10-18", secPerQ: 20, questions: GRAMMAR },
  { id: "s2", title: "Từ vựng IELTS · Unit 6-8", classId: "c1", authorId: "t1", authorName: "Cô Lan Anh", selfPaced: true, mode: "test", testMin: 10, deadline: "2026-10-20", secPerQ: 20, questions: VOCAB },
  { id: "s3", title: "TOEIC Part 5 · luyện nhanh", classId: "c2", authorId: "t2", authorName: "Thầy Hà", selfPaced: false, mode: "game", testMin: 10, deadline: "2026-10-25", secPerQ: 20, questions: TOEIC },
];

export const STUDENTS_TOTAL: Record<string, number> = { c1: 14, c2: 16, c3: 12 };

export const BOT_NAMES = ["Bảo Trân", "Quốc Huy", "Thu Hà", "Đức Anh", "Khánh Linh", "Gia Bảo", "Mai Phương", "Hải Đăng", "Ngọc Diệp", "Tuấn Kiệt", "Thanh Vy", "Minh Quân"];

export const SEED_RESULTS: Record<string, WRResult> = {};
export const SEED_BEST = { score: 1840, rank: 3, players: 14, title: "Ngữ pháp tổng hợp · tuần 41" };
