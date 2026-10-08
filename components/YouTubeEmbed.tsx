type Props = {
  youtubeId: string;
  title?: string;
};

export default function YouTubeEmbed({ youtubeId, title = 'YouTube video' }: Props) {
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}