import { PhraseText } from '../valueObjects/PhraseText';

// ドメインエンティティ：Phrase
export class Phrase {
  constructor(
    public readonly id: string,
    public text: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    PhraseText.create(text);
  }

  static create(text: string): Phrase {
    const validatedText = PhraseText.create(text);
    const now = new Date();
    return new Phrase(
      crypto.randomUUID(),
      validatedText.value,
      now,
      now
    );
  }

  updateText(text: string): void {
    const validatedText = PhraseText.create(text);
    this.text = validatedText.value;
    this.updatedAt = new Date();
  }
}