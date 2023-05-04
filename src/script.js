var weapon = {
  101001: "AKM",
  101002: "M16",
  101003: "SCAR-L",
  101004: "M416",
  101005: "GROZA",
  101006: "AUG",
  101007: "QBZ",
  101008: "M762",
  101009: "Mk47",
  101010: "G36C",
  101011: "AC-VAL",
  101012: "蜜獾",
  102001: "UZI",
  102003: "Vector",
  102004: "汤姆逊",
  102005: "野牛",
  102007: "MP5K",
  102105: "P90",
  103013: "M417",
  103004: "SKS",
  103006: "Mini14",
  103009: "SLR",
  103005: "VSS",
  103010: "QBU",
  103007: "Mk14",
  103003: "AWM",
  103002: "M24",
  103011: "莫辛纳甘",
  103001: "Kar98K",
  103008: "Win94",
  103012: "AMR",
  102002: "UNP45",
  104002: "S1897",
  104001: "S686",
  104100: "SPAS-12",
  104004: "DBS",
  104003: "S12K",
  105002: "DP-28",
  107001: "十字弩",
  105010: "MG3",
  105001: "M249",
  107007: "爆炸猎弓",
  108004: "近战武器",
  108003: "近战武器",
  108002: "近战武器",
  108001: "近战武器",
  106001: "手枪",
  106002: "手枪",
  106003: "手枪",
  106004: "手枪",
  106005: "手枪",
  106006: "手枪",
  106008: "手枪",
  106010: "手枪",
  602001: "震爆弹",
  602002: "烟雾弹",
  602003: "燃烧瓶",
  602004: "手雷",
};
// ********************* 内存相关 *********************
function readInt(addr) {
  return Number(h5gg.getValue(addr, "I32"));
}

function readLong(addr) {
  return Number(h5gg.getValue(addr, "I64"));
}

function readFloat(addr) {
  return Number(h5gg.getValue(addr, "F32"));
}

function isNull(addr) {
  return addr < 0x100000000 || addr > 0x300000000;
}

// ********************* UE4相关 *********************
function RotatorToMatrix(rotation) {
  const radPitch = rotation.Pitch * (Math.PI / 180.0);
  const radYaw = rotation.Yaw * (Math.PI / 180.0);
  const radRoll = rotation.Roll * (Math.PI / 180.0);

  const SP = Math.sin(radPitch);
  const CP = Math.cos(radPitch);
  const SY = Math.sin(radYaw);
  const CY = Math.cos(radYaw);
  const SR = Math.sin(radRoll);
  const CR = Math.cos(radRoll);

  const matrix = new Array(16).fill(0);

  matrix[0] = CP * CY;
  matrix[1] = CP * SY;
  matrix[2] = SP;
  matrix[3] = 0;

  matrix[4] = SR * SP * CY - CR * SY;
  matrix[5] = SR * SP * SY + CR * CY;
  matrix[6] = -SR * CP;
  matrix[7] = 0;

  matrix[8] = -(CR * SP * CY + SR * SY);
  matrix[9] = CY * SR - CR * SP * SY;
  matrix[10] = CR * CP;
  matrix[11] = 0;

  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;

  return matrix;
}

function vectorDot(lhs, rhs) {
  return lhs.X * rhs.X + lhs.Y * rhs.Y + lhs.Z * rhs.Z;
}

function world2Screen(worldLocation, camViewInfo, tempMatrix) {
  // var tempMatrix = RotatorToMatrix(camViewInfo.Rotation);

  const vAxisX = {
    X: tempMatrix[0],
    Y: tempMatrix[1],
    Z: tempMatrix[2],
  };
  const vAxisY = {
    X: tempMatrix[4],
    Y: tempMatrix[5],
    Z: tempMatrix[6],
  };
  const vAxisZ = {
    X: tempMatrix[8],
    Y: tempMatrix[9],
    Z: tempMatrix[10],
  };

  const vDelta = {
    X: worldLocation.X - camViewInfo.Location.X,
    Y: worldLocation.Y - camViewInfo.Location.Y,
    Z: worldLocation.Z - camViewInfo.Location.Z,
  };

  const vTransformed = {
    X: vectorDot(vDelta, vAxisY),
    Y: vectorDot(vDelta, vAxisZ),
    Z: vectorDot(vDelta, vAxisX),
  };

  if (vTransformed.Z < 1.0) {
    vTransformed.Z = 1.0;
  }

  const fov = camViewInfo.FOV;
  const screenCenterX = _width / 2.0;
  const screenCenterY = _height / 2.0;

  const re = {
    X:
      screenCenterX +
      (vTransformed.X * (screenCenterX / Math.tan(fov * (Math.PI / 360.0)))) /
        vTransformed.Z,
    Y:
      screenCenterY -
      (vTransformed.Y * (screenCenterX / Math.tan(fov * (Math.PI / 360.0)))) /
        vTransformed.Z,
  };

  return re;
}
