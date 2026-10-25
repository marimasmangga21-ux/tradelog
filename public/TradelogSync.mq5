//+------------------------------------------------------------------+
//|                                                 TradelogSync.mq5 |
//|                                  Copyright 2026, Tradelog Project |
//|                                       https://github.com/tradelog |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Tradelog"
#property link      "https://github.com/tradelog"
#property version   "1.00"
#property description "Auto-sync trades from MetaTrader 5 to Tradelog Journal"
#property strict

//--- Inputs
input string InpApiUrl      = "https://tradelogjournal-app.vercel.app/api/mt5/ingest"; // Tradelog Ingest URL
input string InpApiSecret   = "tradelog-mt5-secret-key";             // API Secret Key
input bool   InpSyncHistory = true;                                  // Sync past trades on start?
input int    InpHistoryDays = 30;                                    // History lookback (days)

//--- Struct data trade untuk JSON
struct TradePayload
{
   long   position_id;
   long   deal_in;
   long   deal_out;
   string symbol;
   string type;
   double lots;
   double open_price;
   double close_price;
   string open_time;
   string close_time;
   double profit;
   double commission;
   double swap;
   double stop_loss;
   double take_profit;
   string status;
};

//+------------------------------------------------------------------+
//| Format waktu ke format ISO 8601 UTC                             |
//+------------------------------------------------------------------+
string TimeToIsoString(datetime time)
{
   MqlDateTime dt;
   TimeToStruct(time, dt);
   return StringFormat("%04d-%02d-%02dT%02d:%02d:%02d.000Z",
                       dt.year, dt.mon, dt.day, dt.hour, dt.min, dt.sec);
}

//+------------------------------------------------------------------+
//| Kirim JSON Payload ke Tradelog Backend                          |
//+------------------------------------------------------------------+
bool SendJsonToTradelog(string jsonBody)
{
   char postData[];
   char resultData[];
   string resultHeaders;
   int timeout = 10000;

   StringToCharArray(jsonBody, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1); // strip null terminator

   string headers = "Content-Type: application/json\r\n" +
                    "X-Tradelog-Secret: " + InpApiSecret + "\r\n";

   ResetLastError();
   int res = WebRequest("POST", InpApiUrl, headers, timeout, postData, resultData, resultHeaders);

   if(res == -1)
   {
      int err = GetLastError();
      Print("WebRequest failed. Error code: ", err);
      if(err == 4014)
         Print("ERROR 4014: URL not allowed. Add '", InpApiUrl, "' to Tools -> Options -> Expert Advisors -> Allow WebRequest");
      return false;
   }

   string response = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);
   Print("Tradelog response [", res, "]: ", response);
   return (res == 200 || res == 201);
}

//+------------------------------------------------------------------+
//| Sinkronisasi Posisi Terbuka dan Riwayat History                  |
//+------------------------------------------------------------------+
void SyncAllTrades()
{
   datetime fromDate = (InpSyncHistory) ? (TimeCurrent() - InpHistoryDays * 86400) : (TimeCurrent() - 86400);
   datetime toDate   = TimeCurrent() + 86400;

   HistorySelect(fromDate, toDate);
   int totalDeals = HistoryDealsTotal();

   string tradesJson = "";
   int count = 0;

   // 1. Ekstrak riwayat deal yang sudah ditutup
   for(int i = 0; i < totalDeals; i++)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket == 0) continue;

      long entryType = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      // Hanya ambil deal exit (DEAL_ENTRY_OUT) untuk posisi yang sudah ditutup
      if(entryType != DEAL_ENTRY_OUT) continue;

      long dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
      if(dealType != DEAL_TYPE_BUY && dealType != DEAL_TYPE_SELL) continue;

      long posId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      string sym = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
      double lots = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
      double exitPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
      datetime closeTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
      double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      double comm = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      double swap = HistoryDealGetDouble(dealTicket, DEAL_SWAP);

      // Cari deal masuk (DEAL_ENTRY_IN) untuk posisi yang sama
      double entryPrice = exitPrice;
      datetime openTime = closeTime;
      string direction = (dealType == DEAL_TYPE_SELL) ? "BUY" : "SELL"; // jika exit SELL, entry-nya BUY
      long dealInTicket = 0;

      for(int j = 0; j < totalDeals; j++)
      {
         ulong prevDeal = HistoryDealGetTicket(j);
         if(HistoryDealGetInteger(prevDeal, DEAL_POSITION_ID) == posId &&
            HistoryDealGetInteger(prevDeal, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            dealInTicket = (long)prevDeal;
            entryPrice = HistoryDealGetDouble(prevDeal, DEAL_PRICE);
            openTime = (datetime)HistoryDealGetInteger(prevDeal, DEAL_TIME);
            comm += HistoryDealGetDouble(prevDeal, DEAL_COMMISSION);
            long origType = HistoryDealGetInteger(prevDeal, DEAL_TYPE);
            direction = (origType == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            break;
         }
      }

      string itemJson = StringFormat(
         "{\"position_id\":%d,\"deal_in\":%d,\"deal_out\":%d,\"symbol\":\"%s\",\"type\":\"%s\",\"lots\":%.2f,\"open_price\":%.5f,\"close_price\":%.5f,\"open_time\":\"%s\",\"close_time\":\"%s\",\"profit\":%.2f,\"commission\":%.2f,\"swap\":%.2f,\"status\":\"CLOSED\"}",
         posId, dealInTicket, dealTicket, sym, direction, lots, entryPrice, exitPrice,
         TimeToIsoString(openTime), TimeToIsoString(closeTime), profit, comm, swap
      );

      if(count > 0) tradesJson += ",";
      tradesJson += itemJson;
      count++;
   }

   // 2. Ekstrak posisi yang saat ini masih terbuka
   int totalPositions = PositionsTotal();
   for(int p = 0; p < totalPositions; p++)
   {
      ulong posTicket = PositionGetTicket(p);
      if(posTicket == 0) continue;

      long posId = (long)PositionGetInteger(POSITION_IDENTIFIER);
      string sym = PositionGetString(POSITION_SYMBOL);
      long posType = PositionGetInteger(POSITION_TYPE);
      string direction = (posType == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      double lots = PositionGetDouble(POSITION_VOLUME);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double curPrice = PositionGetDouble(POSITION_PRICE_CURRENT);
      datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
      double profit = PositionGetDouble(POSITION_PROFIT);
      double swap = PositionGetDouble(POSITION_SWAP);
      double sl = PositionGetDouble(POSITION_SL);
      double tp = PositionGetDouble(POSITION_TP);

      string openItem = StringFormat(
         "{\"position_id\":%d,\"symbol\":\"%s\",\"type\":\"%s\",\"lots\":%.2f,\"open_price\":%.5f,\"close_price\":%.5f,\"open_time\":\"%s\",\"profit\":%.2f,\"commission\":0.00,\"swap\":%.2f,\"stop_loss\":%.5f,\"take_profit\":%.5f,\"status\":\"OPEN\"}",
         posId, sym, direction, lots, openPrice, curPrice, TimeToIsoString(openTime), profit, swap, sl, tp
      );

      if(count > 0) tradesJson += ",";
      tradesJson += openItem;
      count++;
   }

   // 3. Bangun payload lengkap
   long accNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   string accServer = AccountInfoString(ACCOUNT_SERVER);
   string accName = AccountInfoString(ACCOUNT_NAME);
   double accBal = AccountInfoDouble(ACCOUNT_BALANCE);
   double accEq = AccountInfoDouble(ACCOUNT_EQUITY);
   string accCurr = AccountInfoString(ACCOUNT_CURRENCY);

   string payload = StringFormat(
      "{\"account_number\":%d,\"broker_server\":\"%s\",\"account_name\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"currency\":\"%s\",\"trades\":[%s]}",
      accNumber, accServer, accName, accBal, accEq, accCurr, tradesJson
   );

   Print("Syncing ", count, " trades to Tradelog...");
   SendJsonToTradelog(payload);
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("TradelogSync EA Initialized for Account: ", AccountInfoInteger(ACCOUNT_LOGIN));
   EventSetTimer(60); // Timer cadangan tiap 60 detik
   SyncAllTrades();
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
}

//+------------------------------------------------------------------+
//| Trigger saat transaksi trade / deal baru                         |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
   {
      Print("Trade transaction detected. Triggering sync...");
      SyncAllTrades();
   }
}

//+------------------------------------------------------------------+
//| Timer event function                                             |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncAllTrades();
}
