// ドメインエンティティ：Line（歌詞の行）
export class Line {
  constructor(
    public readonly id: string,
    public readonly sectionId: string,
    public text: string,
    public readonly lineIndex: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    sectionId: string,
    text: string,
    lineIndex: number
  ): Line {
    const now = new Date();
    return new Line(
      crypto.randomUUID(),
      sectionId,
      text,
      lineIndex,
      now,
      now
    );
  }

  updateText(text: string): void {
    this.text = text;
    this.updatedAt = new Date();
  }

  // 文字数カウント（空白除外）
  getCharacterCount(): number {
    return this.text.replace(/\s/g, '').length;
  }

  // 空行判定
  isEmpty(): boolean {
    return this.text.trim() === '';
  }
}