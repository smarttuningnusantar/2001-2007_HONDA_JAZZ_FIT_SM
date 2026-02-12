function CreateModelInf()
{
   // Safety check: ensure gModelInfo is initialized as array
   if (!gModelInfo || typeof(gModelInfo) !== 'object' || !Array.isArray) {
      console.warn("[CreateModelInf] gModelInfo not properly initialized, reinitializing...");
      gModelInfo = [];
      if (typeof(gESM) === 'object') {
         gESM.ModelInfo = gModelInfo;
      }
   }
   
   var   i,j;
   i = 0;
   gModelInfo[i] = SetModelInf('2002');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   i++;
   gModelInfo[i] = SetModelInf('2003');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   i++;
   gModelInfo[i] = SetModelInf('2004');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   i++;
   gModelInfo[i] = SetModelInf('2005');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE2');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE3');
   i++;
   gModelInfo[i] = SetModelInf('2006');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE2');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE3');
   i++;
   gModelInfo[i] = SetModelInf('2007');
   j = 0;
   gModelInfo[i].CodeList[j++] = SetModelCode('GD1');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GD5');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE2');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE3');
   gModelInfo[i].CodeList[j++] = SetModelCode('GE5');
   i++;
}
function SetModelInf(strYear)
{
   var  data = new Array;
   data.Year = strYear;
   data.CodeList = new Array;
   return data;
}
function SetModelCode(strCode)
{
   var  data = new Array;
   data.Code = strCode;
   return data;
}
function SetManualType()
{
   gSmFlag = 1;
   gBrmFlag = -1;
}
