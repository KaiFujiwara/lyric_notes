import { TagName } from '../valueObjects/TagName';
import { ColorCode } from '../valueObjects/ColorCode';

export class Tag {
  constructor(
    public readonly id: string,
    public name: string,
    public color?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    TagName.create(name);
    if (color !== undefined) {
      ColorCode.create(color);
    }
  }

  static create(
    name: string,
    color?: string
  ): Tag {
    const validatedName = TagName.create(name);
    const validatedColor = ColorCode.create(color);
    const now = new Date();
    return new Tag(
      crypto.randomUUID(),
      validatedName.value,
      validatedColor?.value,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = TagName.create(name);
    this.name = validatedName.value;
    this.updatedAt = new Date();
  }

  updateColor(color?: string): void {
    const validatedColor = ColorCode.create(color);
    this.color = validatedColor?.value;
    this.updatedAt = new Date();
  }

}