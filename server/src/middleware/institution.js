export const verifyInstitutionOwnership = (req, res, next) => {
  // Company role is not bound to a single institution
  if (req.user && req.user.role === 'company') {
    return next();
  }

  const userInstitutionId = req.user?.institution?.toString();
  const targetInstitutionId =
    req.params.institutionId ||
    req.body.institutionId ||
    req.body.institution ||
    req.query.institutionId;

  if (targetInstitutionId && userInstitutionId !== targetInstitutionId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot view or modify resources outside your enrolled institution.',
    });
  }

  next();
};
