import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CardImage } from "./CardImage";

describe("CardImage", () => {
  it("renders an <img> with src and alt when src is provided", () => {
    render(<CardImage src="https://example.com/a.jpg" alt="Lipstick" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/a.jpg");
    expect(img.alt).toBe("Lipstick");
  });

  it("renders a gradient placeholder when src is missing", () => {
    render(<CardImage alt="Lipstick" />);
    expect(screen.queryByRole("img")).toBeNull();
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback).toBeInTheDocument();
  });

  it("swaps to the gradient placeholder when the image errors", () => {
    render(<CardImage src="https://bad.example/x" alt="x" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByTestId("card-image-fallback")).toBeInTheDocument();
  });

  it("applies the square aspect by default", () => {
    render(<CardImage alt="x" />);
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback.className).toMatch(/aspect-square\b/);
  });

  it("applies the video aspect when requested", () => {
    render(<CardImage alt="x" aspect="video" />);
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback.className).toMatch(/aspect-video\b/);
  });
});
