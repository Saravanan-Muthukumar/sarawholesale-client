export default function VoucherRedeem({
    voucherCode,
    setVoucherCode,
    voucherLoading,
    voucherMessage,
    voucherApplied,
    discountAmount,
    onRedeemVoucher,
    onClearVoucher,
  }) {
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      if (voucherLoading || voucherApplied) return;
  
      await onRedeemVoucher();
    };
  
    return (
      <div className="mt-5 border-t border-[#edf1f7] pt-4">
        <p className="mb-2 text-sm font-bold text-[#071b3a]">
          Voucher code
        </p>
  
        <form
          onSubmit={handleSubmit}
          className="flex items-stretch"
        >
          <input
            type="text"
            value={voucherCode}
            onChange={(event) => {
              setVoucherCode(event.target.value.toUpperCase());
            }}
            disabled={voucherLoading || voucherApplied}
            placeholder="Enter voucher code"
            autoComplete="off"
            className="min-w-0 flex-1 h-11 border border-r-0 border-gray-300 bg-white px-3 text-sm font-semibold text-[#071b3a] outline-none focus:border-green-700 disabled:bg-gray-100 disabled:text-gray-500"
          />
  
          {voucherApplied ? (
            <button
              type="button"
              onClick={onClearVoucher}
              className="h-11 shrink-0 bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
            >
              Remove
            </button>
          ) : (
            <button
              type="submit"
              disabled={voucherLoading || !voucherCode.trim()}
              className="h-11 shrink-0 bg-green-700 px-4 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {voucherLoading ? "Checking..." : "Redeem"}
            </button>
          )}
        </form>
  
        {voucherMessage && (
          <p
            className={`mt-2 text-xs font-semibold ${
              voucherApplied ? "text-green-700" : "text-red-600"
            }`}
          >
            {voucherMessage}
          </p>
        )}
  
        {voucherApplied && discountAmount > 0 && (
          <p className="mt-1 text-xs font-semibold text-green-700">
            Voucher applied. You saved £{discountAmount.toFixed(2)}.
          </p>
        )}
      </div>
    );
  }