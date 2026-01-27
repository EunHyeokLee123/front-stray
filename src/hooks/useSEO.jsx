import { useEffect } from "react";

export function useSEO({ title, description, image, canonical }) {
  useEffect(() => {
    /* title */
    if (title) document.title = title;

    /* description */
    if (description) {
      let tag = document.querySelector('meta[name="description"]');

      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", description);
    }

    /* og:image */
    if (image) {
      let og = document.querySelector('meta[property="og:image"]');

      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:image");
        document.head.appendChild(og);
      }

      og.setAttribute("content", image);
    }

    /* canonical */
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');

      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }

      link.setAttribute("href", canonical);
    }
  }, [title, description, image, canonical]);
}
