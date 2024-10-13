"use client";

import { useState } from "react";

import { GoogleLogin } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";

import * as jwt_decode from "jwt-decode";

import Web3 from "web3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string }) => Promise<unknown>;
    };
  }
}

const Navbar = () => {
  const [account, setAccount] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const connectToMetaMask = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("MetaMask connection failed", error);
    }
  };

  const logoutFromMetaMask = () => {
    setAccount("");
    googleLogout();
  };

  return (
    <nav className="border border-b-gray-200 py-2 px-10 flex justify-end gap-x-3">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10">
          {account ? `Connected: ${account.slice(0, 6)}...` : "Login"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center pb-5">Login</DialogTitle>
            <DialogDescription className="flex flex-col items-center gap-y-4">
              {!account && (
                <>
                  <button
                    className="py-2.5 px-5 mt-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-[70%]"
                    onClick={connectToMetaMask}
                  >
                    Connect to MetaMask
                  </button>

                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (!credentialResponse.credential) {
                        alert("Login Failed");
                        return;
                      }

                      const data: { email: string } = jwt_decode.jwtDecode(
                        credentialResponse.credential
                      );

                      setAccount(data.email);
                      setIsDialogOpen(false);
                    }}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </>
              )}

              {account && (
                <section>
                  <h1 className="font-semibold">Account: {account}</h1>
                </section>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {account && (
        <button
          className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10"
          onClick={logoutFromMetaMask}
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
