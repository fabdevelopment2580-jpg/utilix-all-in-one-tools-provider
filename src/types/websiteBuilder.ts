export interface GeneratedFile {
  path: string; // e.g. "index.html", "about.html", "services.html", "css/style.css", "js/script.js"
  name: string; // e.g. "index.html"
  type: 'html' | 'css' | 'js' | 'asset';
  content: string;
}

export interface WebsiteProject {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  files: GeneratedFile[];
  activePagePath: string;
  settings: {
    style: string;
    colors: string;
    typography: string;
    animations: string;
    pagesCount: number;
  };
}

export interface SelectedElementInfo {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  innerText: string;
  attributes: Record<string, string>;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    border?: string;
    display?: string;
    textAlign?: string;
  };
}

export interface GenerationOptions {
  type: string;
  pagesCount: number;
  style: string;
  colors: string;
  typography: string;
  animations: string;
}
