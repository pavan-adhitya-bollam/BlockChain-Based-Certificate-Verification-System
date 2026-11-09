import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import VerificationStatusBadge from "../components/VerificationStatusBadge";
import LoginPage from "../pages/LoginPage";
import { AuthProvider } from "../context/AuthContext";

describe("Frontend Component Tests", () => {
  describe("1. Verification Status Badge Component", () => {
    it("should render GENUINE & VALID status with appropriate styles", () => {
      render(<VerificationStatusBadge status="VALID" />);
      expect(screen.getByText("GENUINE & VALID")).toBeInTheDocument();
    });

    it("should render OFFICIALLY REVOKED status", () => {
      render(<VerificationStatusBadge status="REVOKED" />);
      expect(screen.getByText("OFFICIALLY REVOKED")).toBeInTheDocument();
    });

    it("should render HASH MISMATCH / TAMPERED status", () => {
      render(<VerificationStatusBadge status="HASH_MISMATCH" />);
      expect(screen.getByText("HASH MISMATCH / TAMPERED")).toBeInTheDocument();
    });

    it("should render NOT FOUND ON CHAIN status", () => {
      render(<VerificationStatusBadge status="NOT_FOUND" />);
      expect(screen.getByText("NOT FOUND ON CHAIN")).toBeInTheDocument();
    });

    it("should render VERIFICATION UNAVAILABLE status", () => {
      render(<VerificationStatusBadge status="VERIFICATION_UNAVAILABLE" />);
      expect(screen.getByText("VERIFICATION UNAVAILABLE")).toBeInTheDocument();
    });
  });

  describe("2. Login Form Validation & Interactions", () => {
    it("should render email, password inputs and sign-in button", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText(/admin@institution.edu/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("should auto-fill demo administrator credentials when 1-click button clicked", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const adminDemoBtn = screen.getByText(/Admin \/ Dean/i);
      fireEvent.click(adminDemoBtn);

      const emailInput = screen.getByPlaceholderText(/admin@institution.edu/i);
      expect(emailInput.value).toBe("admin@institution.edu");
    });

    it("should auto-fill demo student credentials when student demo button clicked", () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const studentDemoBtn = screen.getByText(/Adarsh Challa/i);
      fireEvent.click(studentDemoBtn);

      const emailInput = screen.getByPlaceholderText(/admin@institution.edu/i);
      expect(emailInput.value).toBe("adarsh.challa@student.edu");
    });
  });
});
