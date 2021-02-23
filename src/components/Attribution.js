import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

const Attribution = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Compliments of "}
      <Link color="inherit" target="_blank" href="https://brotherapp.org">
        <strong>Brother App</strong>
      </Link>
    </Typography>
  );
};

export default Attribution;
