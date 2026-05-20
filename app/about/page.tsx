import Link from 'next/link';

export default function About() {
  return (
    <main aria-labelledby="title" className="padding-large">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="display-header text-center">
              <h2 id="title" className="display-2 text-capitalize text-dark pb-2">About Us</h2>
              <p className="pb-3">
                Crafted by hand or printed with passion, DesigNagArtistry brings you fashion that&apos;s truly one of a kind.
                Wear the story. Wear the art.
              </p>
              <p className="pb-3">
                We create handcrafted clothing and accessories for both men and women — designed with love,
                artistic intention, and attention to detail. Every piece is made to be as unique as the person wearing it.
              </p>
              <p className="pb-3">
                From artisan-crafted outfits to boldly printed fashion pieces, our collections celebrate
                individuality and self-expression. We don&apos;t do ordinary. We do one of a kind.
              </p>
              <Link href="/" className="btn btn-medium btn-arrow outline-dark position-relative mt-3">
                <span className="text-capitalize">Back to Home</span>
                <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
