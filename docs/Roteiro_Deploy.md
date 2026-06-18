## RODAR NA MAQUINA LOCAL NA PASTA RAIZ DO PROJETO

git add .

git commit -m "altera layout da pagina consultar desempenho"

git push manuela HEAD:main
git push origin HEAD:nextfut-mvp-atual


## ENTRAR NA VM

ssh -i $env:USERPROFILE\.ssh\gcp_nextfut fausto@35.222.148.196


## EXECUTAR NA VM

cd ~/nextfut

git pull origin main

cd ~/nextfut/frontend

npm install
npm run build


sudo nginx -t
sudo systemctl reload nginx

