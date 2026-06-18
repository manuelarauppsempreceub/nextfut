## RODAR NA MAQUINA LOCAL NA PASTA RAIZ DO PROJETO

git add .

git commit -m "altera os graficos de teia - titulo do radar tecnico"

git push manuela HEAD:main
git push origin HEAD:nextfut-mvp-atual


## ENTRAR NA VM

ssh -i $env:USERPROFILE\.ssh\gcp_nextfut fausto@35.222.148.196


## EXECUTAR NA VM

cd ~/nextfut

git pull origin main


## Se alterou o front

cd ~/nextfut/frontend

npm install
npm run build


sudo nginx -t
sudo systemctl reload nginx

## Se alterou o back

cd ~/nextfut/backend

npm install
npx prisma generate
pm2 restart nextfut-backend
pm2 list
curl http://localhost:3000/api/health


