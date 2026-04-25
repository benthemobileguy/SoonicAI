import { IsNotEmpty, IsUrl, Matches, MaxLength } from 'class-validator';

export class AnalyzeUrlDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    { message: 'Invalid URL format' },
  )
  @Matches(
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
    { message: 'Must be a valid YouTube URL' },
  )
  @MaxLength(2048, { message: 'URL is too long' })
  url: string;
}
