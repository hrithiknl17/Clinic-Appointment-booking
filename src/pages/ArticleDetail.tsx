import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User } from "lucide-react";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`https://clinic-appointment-booking-fglv.onrender.com/api/articles/${id}`);
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading Article...</div>;
  if (!article) return <div className="p-20 text-center">Article not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button asChild variant="ghost" className="mb-8">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      
      <img src={article.image_url} alt={article.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {article.author_name}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {article.read_time}</span>
      </div>
      
      <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
      <div className="prose prose-slate max-w-none text-lg leading-relaxed text-muted-foreground">
        {article.content}
      </div>
    </div>
  );
};

export default ArticleDetail;