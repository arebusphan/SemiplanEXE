# Giai đoạn Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Sao chép solution và các file .csproj để tận dụng cache của Docker
COPY Semiplan.sln ./
COPY SemiplanAPI/SemiplanAPI.csproj SemiplanAPI/
COPY SemiplanData/SemiplanData.csproj SemiplanData/
COPY SemiplanRepository/SemiplanRepository.csproj SemiplanRepository/
COPY SemiplanService/SemiplanService.csproj SemiplanService/

# Phục hồi các dependencies
RUN dotnet restore

# Sao chép toàn bộ mã nguồn còn lại
COPY . .

# Build và Publish dự án SemiplanAPI với cấu hình Release
WORKDIR /src/SemiplanAPI
RUN dotnet publish -c Release -o /app/publish

# Giai đoạn Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy kết quả đã publish từ giai đoạn build
COPY --from=build /app/publish .

# Render tự động gán cổng mạng thông qua biến môi trường PORT. 
# Tuy nhiên mặc định ASP.NET Core 8+ trong container sử dụng cổng 8080.
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "SemiplanAPI.dll"]
